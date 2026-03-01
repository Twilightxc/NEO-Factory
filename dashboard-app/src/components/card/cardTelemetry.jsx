import React from 'react';
import { useStore } from '../../store/useStore';
import { formatSensorValue } from '../../utils/utils';
import { AlertTriangle } from 'lucide-react';

/**
 * 🎯 Extra Large Mini Badge (XL) - สำหรับระบบ Digital Twin
 * แก้ไขข้อที่ 4: เปลี่ยนแหล่งข้อมูลจาก devices เป็น telemetry object ใน Store
 */
const CardTelemetry = ({ deviceId, telemetryKey, label, unit, threshold, x, y, icon: Icon, decimals = 1 }) => {
    // 📡 1. ดึง telemetry state มาใช้งาน (นี่คือจุดที่ข้อมูล Mock ถูกอัปเดตทุก 3 วินาที)
    const isDarkMode = useStore((state) => state.isDarkMode);
    const telemetry = useStore((state) => state.telemetry);

    // 📊 2. ดึงข้อมูลเซ็นเซอร์ของอุปกรณ์นี้จาก Store
    const deviceData = telemetry[deviceId] || {};
    let value = deviceData[telemetryKey] ?? 0;

    // 🚨 3. ตรวจสอบสถานะ Alert
    const isWarning = threshold !== undefined && value > threshold;
    const activeColor = isWarning ? "#ef4444" : (isDarkMode ? "#38bdf8" : "#0ea5e9");
    const bgColor = isDarkMode ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.98)";

    return (
        <g transform={`translate(${x}, ${y})`} className="select-none transition-all duration-500">
            {/* 🔲 Background XL (300x110) จากข้อ 2 */}
            <rect
                width="300" height="110" rx="15"
                fill={bgColor} stroke={activeColor} strokeWidth="4"
                className={isWarning ? "animate-pulse" : ""}
                style={{
                    filter: isWarning ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                }}
            />

            {/* ℹ️ Icon & Label Section */}
            <g transform="translate(20, 35)">
                <foreignObject width="30" height="30" y="-24">
                    {isWarning ?
                        <AlertTriangle color="#ef4444" size={28} strokeWidth={3} /> :
                        Icon && <Icon color={activeColor} size={28} strokeWidth={2.5} />
                    }
                </foreignObject>
                <text x="40" fill={isDarkMode ? "#94a3b8" : "#64748b"} fontSize="18" fontWeight="800" fontFamily="sans-serif" className="uppercase tracking-wider">
                    {label}
                </text>
            </g>

            {/* 🔢 Value Display: ดึงจาก telemetry[deviceId] ที่เปลี่ยนไปเรื่อยๆ */}
            <text x="20" y="90" fill={activeColor} fontSize="48" fontWeight="900" fontFamily="'Courier New', monospace" letterSpacing="-1">
                {formatSensorValue(value, decimals)}
                <tspan fontSize="20" dx="10" fontWeight="700" opacity="0.6">{unit}</tspan>
            </text>

            {/* 🔔 Warning Indicator */}
            {isWarning && <circle cx="280" cy="20" r="6" fill="#ef4444" className="animate-ping" />}
        </g>
    );
};

export default CardTelemetry;