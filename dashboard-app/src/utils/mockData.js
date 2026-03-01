// 🚩 เปลี่ยนเป็น false เมื่อต้องการใช้ข้อมูลจริงจาก ThingsBoard
export const USE_SIMULATION = true;

/**
 * 1. ฟังก์ชันเดิม: จำลองค่า Real-time สำหรับ Digital Twin
 */
export const getSimulatedTelemetry = (deviceId) => {
    const isSet1 = deviceId?.includes('01') || deviceId === 'mock-p1';
    const basePressureIn = isSet1 ? 8.5 : 7.2;
    const baseAirflow = isSet1 ? 250 : 180;

    const pressure_in = basePressureIn + (Math.random() * 0.4 - 0.2);
    const pressure_out = pressure_in - (Math.random() * 0.3 + 0.1);

    return {
        pressure_in: Number(pressure_in.toFixed(2)),
        pressure_out: Number(pressure_out.toFixed(2)),
        delta_pressure: Number((pressure_in - pressure_out).toFixed(2)),
        humidity: Number((Math.random() * 5 + 30).toFixed(2)),
        air_flow: Number((baseAirflow + (Math.random() * 20 - 10)).toFixed(2)),
        last_update: new Date().toLocaleTimeString()
    };
};

/**
 * 2. 🆕 ฟังก์ชันใหม่: จำลองชุดข้อมูลย้อนหลังสำหรับทำกราฟ (History Data)
 * @param {number} points - จำนวนจุดข้อมูลที่ต้องการ (เช่น 20 จุดย้อนหลัง)
 */
export const generateMockHistory = (deviceId, points = 20) => {
    const history = [];
    const now = new Date();

    for (let i = 0; i < points; i++) {
        // ย้อนเวลาไปจุดละ 5 นาที
        const timeLabel = new Date(now.getTime() - (i * 5 * 60000));
        const data = getSimulatedTelemetry(deviceId);

        history.unshift({
            ...data,
            timestamp: timeLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fullDate: timeLabel.toISOString()
        });
    }
    return history;
};

/**
 * 3. 🆕 ฟังก์ชันสำหรับจำลองการดึงข้อมูลเพื่อ Export (CSV/Excel)
 */
export const getExportData = (deviceId) => {
    const history = generateMockHistory(deviceId, 50); // จำลอง 50 แถวสำหรับรายงาน
    return history.map(item => ({
        'Timestamp': item.fullDate,
        'Pressure In (Bar)': item.pressure_in,
        'Pressure Out (Bar)': item.pressure_out,
        'Delta P (Bar)': item.delta_pressure,
        'Air Flow (M3/H)': item.air_flow,
        'Humidity (%)': item.humidity
    }));
};

export const MOCK_DEVICES = [
    { id: { id: 'mock-p1' }, name: 'ELGi Compressor 01' },
    { id: { id: 'mock-p2' }, name: 'ELGi Compressor 02' }
];