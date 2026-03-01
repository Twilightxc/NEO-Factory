# ใช้ Python แบบ slim เพื่อลดขนาด Image
FROM python:3.11-slim

# ตั้งค่า Environment เพื่อให้ Log แสดงผลทันที
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# ตั้งค่า Working Directory
WORKDIR /app

# ติดตั้ง dependencies ที่จำเป็นสำหรับ Postgres
# เพิ่ม curl เผื่อไว้ทำ Healthcheck ในอนาคต
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# คัดลองไฟล์ requirements และติดตั้ง
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลองโค้ดทั้งหมดเข้าเครื่อง
COPY . .

# สั่งรันด้วย Uvicorn บนพอร์ต 8000 (ให้ตรงกับ nginx.conf)
# หากอยู่ในช่วงพัฒนา (Dev) สามารถเติม --reload ได้ครับ
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]