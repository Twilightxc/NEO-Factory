from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import os
import time
import io
from typing import Optional, List
from dotenv import load_dotenv
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch

# โหลด Environment [cite: 2026-02-19]
load_dotenv(dotenv_path='.env.production')

DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(
    title="NEO-Factory Sidecar API",
    description="Industrial IoT Data Processing & Analytics API",
    version="2.0.0"
)

# ✅ ปรับปรุงระบบการเชื่อมต่อฐานข้อมูลให้รองรับการรอ (Waiting for DB) [cite: 2025-10-27]
def get_db_engine():
    """
    สร้าง Database Engine พร้อมระบบ Retry สำหรับรอ PostgreSQL พร้อมใช้งาน
    """
    retries = 5
    while retries > 0:
        try:
            engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,  # ตรวจสอบการเชื่อมต่อก่อนใช้
                pool_size=10,
                max_overflow=20
            )
            # ทดสอบการเชื่อมต่อจริง
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connected successfully!")
            return engine
        except Exception as e:
            print(f"📡 Database not ready... retrying in 5s ({retries} left). Error: {e}")
            time.sleep(5)
            retries -= 1
    raise Exception("❌ Could not connect to database after several retries.")

# สร้าง Engine แบบปลอดภัย
try:
    engine = get_db_engine()
except Exception as e:
    print(e)
    # หากเชื่อมต่อไม่ได้จริงๆ ให้รันต่อแบบไม่มี DB เพื่อไม่ให้ Container Crash วนลูป
    engine = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# Helper Functions
# ================================

def downsample_data(df: pd.DataFrame, interval_minutes: int = 5) -> pd.DataFrame:
    """
    Downsample ข้อมูลเป็นค่าเฉลี่ยตามช่วงเวลาที่กำหนด (เช่น 5 นาที)
    เพื่อลด Data Points และป้องกัน Frontend Lag
    """
    if df.empty:
        return df
    
    # แปลง timestamp (ms) เป็น datetime
    df['timestamp'] = pd.to_datetime(df['ts'], unit='ms')
    df.set_index('timestamp', inplace=True)
    
    # Resample และหาค่าเฉลี่ย
    df_resampled = df.groupby(['key']).resample(f'{interval_minutes}T').mean().reset_index()
    
    # แปลงกลับเป็น milliseconds
    df_resampled['ts'] = df_resampled['timestamp'].astype('int64') // 10**6
    
    return df_resampled[['ts', 'key', 'dbl_v']]

def calculate_time_range_hours(start_ts: int, end_ts: int) -> float:
    """คำนวณช่วงเวลาเป็นชั่วโมง"""
    return (end_ts - start_ts) / (1000 * 60 * 60)

# ================================
# API Endpoints
# ================================

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "NEO-Factory Sidecar-API is running",
        "version": "2.0.0",
        "db_connected": engine is not None,
        "database_url": DATABASE_URL.split('@')[1] if DATABASE_URL and '@' in DATABASE_URL else "hidden"
    }

@app.get("/analytics/history")
async def get_history(
    device_id: str = Query(..., description="Device UUID from ThingsBoard"),
    keys: str = Query("pressure_in,pressure_out,delta_pressure,humidity,air_flow", 
                      description="Comma-separated keys to fetch"),
    start_ts: Optional[int] = Query(None, description="Start timestamp in milliseconds"),
    end_ts: Optional[int] = Query(None, description="End timestamp in milliseconds"),
    threshold: Optional[float] = Query(None, description="Minimum value threshold (e.g., pressure > 40)"),
    downsample: bool = Query(True, description="Enable auto-downsampling for large datasets")
):
    """
    📊 Fetch time-series history data with filtering and downsampling
    
    Features:
    - Multi-key fetching (pressure_in, pressure_out, etc.)
    - Time range filtering
    - Value threshold filtering
    - Automatic downsampling for ranges > 24h
    """
    if not engine:
        raise HTTPException(status_code=503, detail="Database connection not available")
    
    # Default time range: last 7 days
    if not end_ts:
        end_ts = int(datetime.now().timestamp() * 1000)
    if not start_ts:
        start_ts = int((datetime.now() - timedelta(days=7)).timestamp() * 1000)
    
    # Parse keys
    key_list = [k.strip() for k in keys.split(',')]
    
    # Build query with optional threshold
    threshold_clause = f"AND dbl_v > :threshold" if threshold is not None else ""
    
    query = text(f"""
        SELECT ts, key, dbl_v 
        FROM ts_kv 
        WHERE entity_id = :device_id 
        AND key = ANY(:keys)
        AND ts BETWEEN :start_ts AND :end_ts
        {threshold_clause}
        ORDER BY ts ASC
    """)
    
    try:
        params = {
            "device_id": device_id,
            "keys": key_list,
            "start_ts": start_ts,
            "end_ts": end_ts
        }
        
        if threshold is not None:
            params["threshold"] = threshold
        
        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params=params)
        
        # Check if empty
        if df.empty:
            return {
                "device_id": device_id,
                "time_range_hours": calculate_time_range_hours(start_ts, end_ts),
                "data_points": 0,
                "downsampled": False,
                "data": []
            }
        
        # Auto-downsampling for large time ranges (> 24 hours)
        time_range_hours = calculate_time_range_hours(start_ts, end_ts)
        is_downsampled = False
        
        if downsample and time_range_hours > 24:
            # Calculate appropriate interval (5-min for 1-7 days, 15-min for > 7 days)
            interval_minutes = 5 if time_range_hours <= 168 else 15
            df = downsample_data(df, interval_minutes=interval_minutes)
            is_downsampled = True
        
        # Convert to frontend-friendly format
        result = []
        for key in key_list:
            key_data = df[df['key'] == key].copy()
            if not key_data.empty:
                key_data['timestamp'] = pd.to_datetime(key_data['ts'], unit='ms').dt.strftime('%Y-%m-%d %H:%M:%S')
                result.append({
                    "key": key,
                    "values": key_data[['timestamp', 'dbl_v', 'ts']].rename(columns={'dbl_v': 'value'}).to_dict('records')
                })
        
        return {
            "device_id": device_id,
            "time_range_hours": round(time_range_hours, 2),
            "data_points": len(df),
            "downsampled": is_downsampled,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/analytics/export")
async def export_report(
    format: str = Query(..., description="Export format: csv, excel, or pdf"),
    device_id: str = Query(..., description="Device UUID"),
    keys: str = Query("pressure_in,pressure_out,delta_pressure,humidity,air_flow"),
    start_ts: Optional[int] = Query(None),
    end_ts: Optional[int] = Query(None),
    threshold: Optional[float] = Query(None)
):
    """
    📥 Export analytics data in multiple formats
    
    Supported formats:
    - CSV: Raw data export
    - Excel: Formatted spreadsheet with summary
    - PDF: Professional report with charts
    """
    if not engine:
        raise HTTPException(status_code=503, detail="Database connection not available")
    
    # Reuse history endpoint logic
    history_data = await get_history(
        device_id=device_id,
        keys=keys,
        start_ts=start_ts,
        end_ts=end_ts,
        threshold=threshold,
        downsample=False  # Full resolution for export
    )
    
    if not history_data["data"]:
        raise HTTPException(status_code=404, detail="No data found for the specified criteria")
    
    # Prepare DataFrame for export
    dfs = []
    for key_data in history_data["data"]:
        temp_df = pd.DataFrame(key_data["values"])
        temp_df['key'] = key_data["key"]
        dfs.append(temp_df)
    
    df_export = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()
    
    # Pivot for better readability
    df_pivot = df_export.pivot(index='timestamp', columns='key', values='value').reset_index()
    
    # Generate file based on format
    if format.lower() == 'csv':
        output = io.StringIO()
        df_pivot.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=analytics_{device_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
    
    elif format.lower() == 'excel':
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Data sheet
            df_pivot.to_excel(writer, sheet_name='Data', index=False)
            
            # Summary sheet
            summary_df = df_pivot.describe()
            summary_df.to_excel(writer, sheet_name='Summary')
            
            # Metadata sheet
            metadata = pd.DataFrame({
                'Parameter': ['Device ID', 'Export Date', 'Time Range (hours)', 'Data Points', 'Threshold Applied'],
                'Value': [
                    device_id,
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    history_data['time_range_hours'],
                    history_data['data_points'],
                    threshold if threshold else 'None'
                ]
            })
            metadata.to_excel(writer, sheet_name='Metadata', index=False)
        
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=analytics_{device_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"}
        )
    
    elif format.lower() == 'pdf':
        output = io.BytesIO()
        
        # Create PDF
        doc = SimpleDocTemplate(output, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph(f"<b>NEO-Factory Analytics Report</b>", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Metadata
        metadata_text = f"""
        <b>Device ID:</b> {device_id}<br/>
        <b>Export Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>
        <b>Time Range:</b> {history_data['time_range_hours']} hours<br/>
        <b>Data Points:</b> {history_data['data_points']}<br/>
        <b>Threshold:</b> {threshold if threshold else 'None'}
        """
        elements.append(Paragraph(metadata_text, styles['Normal']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Summary Statistics Table
        summary_title = Paragraph("<b>Summary Statistics</b>", styles['Heading2'])
        elements.append(summary_title)
        elements.append(Spacer(1, 0.1 * inch))
        
        summary_data = [['Metric', 'Min', 'Max', 'Mean', 'Std Dev']]
        for col in df_pivot.columns:
            if col != 'timestamp':
                stats = df_pivot[col].describe()
                summary_data.append([
                    col,
                    f"{stats['min']:.2f}",
                    f"{stats['max']:.2f}",
                    f"{stats['mean']:.2f}",
                    f"{stats['std']:.2f}"
                ])
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Data Sample (first 20 rows)
        data_title = Paragraph("<b>Data Sample (First 20 Rows)</b>", styles['Heading2'])
        elements.append(data_title)
        elements.append(Spacer(1, 0.1 * inch))
        
        sample_data = [df_pivot.columns.tolist()]
        for _, row in df_pivot.head(20).iterrows():
            sample_data.append([str(val)[:15] for val in row.tolist()])
        
        data_table = Table(sample_data)
        data_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        
        elements.append(data_table)
        
        # Build PDF
        doc.build(elements)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=analytics_{device_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'csv', 'excel', or 'pdf'")

@app.get("/health")
def health_check():
    """Kubernetes-ready health check endpoint"""
    if not engine:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database health check failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)