import React, { useEffect } from 'react';
import { useStore } from '../store/useStore'; //
import { AlertTriangle } from 'lucide-react';
import MachineMap from '../components/Twin/MachineMap';
import { USE_SIMULATION } from '../utils/mockData'; //

const Dashboard = () => {
    // 🔗 เชื่อมต่อกับ Store เพื่อดึงข้อมูลสถานะระบบ
    const {
        isDarkMode,
        devices,
        selectedDeviceId,
        setSelectedDevice,
        hasAlarm,
        alarms,
        runSimulationStep
    } = useStore();

    // 🧪 ระบบจำลองข้อมูล (Simulation Mode): อัปเดตข้อมูลทุก 3 วินาที
    useEffect(() => {
        if (!USE_SIMULATION) return;
        const timer = setInterval(() => { runSimulationStep(); }, 3000);
        return () => clearInterval(timer);
    }, [runSimulationStep]);

    /**
     * 🎯 🆕 ระบบ Force Reset ID (แก้ไขปัญหาตัวเลขไม่ขยับ)
     * ตรวจสอบว่า ID ปัจจุบัน "มีตัวตนอยู่จริง" ในระบบหรือไม่ 
     * เพื่อป้องกันกรณีค่าเก่าจาก LocalStorage ค้างอยู่จนทำให้หาข้อมูล Telemetry ไม่เจอ
     */
    useEffect(() => {
        // 🔍 ตรวจสอบความถูกต้องของ ID ปัจจุบันในรายการอุปกรณ์
        const isValidId = devices.some(d => (d.id.id || d.id) === selectedDeviceId);

        // 🚩 เงื่อนไข: ถ้ายังไม่มีการเลือก ID หรือ ID ที่มีอยู่ "ไม่ถูกต้อง" ให้บังคับเลือกตัวแรกทันที
        if ((!selectedDeviceId || !isValidId) && devices.length > 0) {
            const firstDeviceId = devices[0].id.id || devices[0].id;
            setSelectedDevice(firstDeviceId);
            console.log(`[System] Stale ID detected or Missing. Force Resetting to: ${firstDeviceId}`);
        }
    }, [devices, selectedDeviceId, setSelectedDevice]);

    // ⏳ หน้าจอ Loading ระหว่างรอข้อมูลเครื่องจักร
    if (devices.length === 0) {
        return (
            <div className={`h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-2xl font-bold opacity-50 uppercase tracking-widest">Initializing Digital Twin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>

            {/* 📋 Header: แสดงชื่อระบบและสถานะ Node ปัจจุบัน */}
            <header className={`px-10 py-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                <div className="flex flex-col">
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">Neo-Factory Digital Twin</h1>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-lg text-blue-500 font-bold uppercase tracking-widest">
                            {/* แสดงชื่ออุปกรณ์ที่เลือกอยู่ ถ้าหาไม่เจอจะขึ้น Connecting... */}
                            Live Node: {devices.find(d => (d.id.id || d.id) === selectedDeviceId)?.name || 'Connecting...'}
                        </p>
                    </div>
                </div>

                {/* 🚨 แจ้งเตือนเมื่อเกิดความผิดปกติในระบบ */}
                {hasAlarm && (
                    <div className="flex items-center gap-4 bg-red-600/10 border border-red-500/50 px-6 py-3 rounded-2xl animate-pulse">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                        <div className="text-sm font-bold">
                            <span className="text-red-500 uppercase mr-2">System Alert:</span>
                            {alarms[0]?.message || 'Check Sensors'}
                        </div>
                    </div>
                )}
            </header>

            {/* 🟢 Main Visualizer: พื้นที่แสดงผล Digital Twin (SVG) */}
            <div className="flex-1 relative flex items-start justify-center p-6 bg-black/5 overflow-hidden">

                {/* 🚩 ปรับตำแหน่งโมเดลให้ขยับขึ้นเล็กน้อย เพื่อความสมดุลของสายตา */}
                <div className="w-full h-full max-w-[3840px] max-h-[2160px] flex items-start justify-center relative mt-[-2%] transition-all duration-700">
                    <MachineMap />
                </div>

                {/* Overlay Decals: ข้อมูลเวอร์ชันระบบด้านมุมล่าง */}
                <div className="absolute bottom-10 left-10 opacity-30 pointer-events-none">
                    <p className="text-xs font-mono uppercase tracking-[1em]">Industrial Scada v4.0</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;