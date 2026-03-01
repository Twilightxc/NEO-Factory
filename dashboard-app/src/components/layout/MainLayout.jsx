import React, { useState } from 'react'; // 🚩 เพิ่ม useState [cite: 2025-10-27]
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../../store/useStore';
import { Bell, Sun, Moon, Trash2, AlertTriangle, Check } from 'lucide-react';

const MainLayout = () => {
    // ดึงค่าจาก Store [cite: 2026-02-13]
    const { isDarkMode, toggleTheme, hasAlarm, alarmCount, alarms, clearAlarms } = useStore();

    // 🚩 1. เพิ่ม State สำหรับคุมการเปิด/ปิด Dropdown [cite: 2025-10-27]
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
            <Sidebar />

            <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">

                {/* Toolbar ด้านขวาบน */}
                <header className="absolute top-6 right-10 z-[60] flex items-center gap-4">

                    {/* 🚨 Notification Bell Container */}
                    <div className="relative">
                        <button
                            // 🚩 2. เพิ่ม onClick เพื่อ Toggle [cite: 2025-10-27]
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-4 rounded-2xl transition-all relative ${isDarkMode ? 'bg-slate-900/80 hover:bg-slate-800' : 'bg-white hover:bg-gray-100'
                                } shadow-xl active:scale-95`}
                        >
                            <Bell className={`w-8 h-8 ${hasAlarm ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                            {hasAlarm && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-slate-950">
                                    {alarmCount > 9 ? '9+' : alarmCount}
                                </span>
                            )}
                        </button>

                        {/* 🚩 3. เพิ่ม UI ของ Dropdown List [cite: 2025-10-27] */}
                        {showNotifications && (
                            <div className={`absolute top-20 right-0 w-96 rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in duration-200 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                                }`}>
                                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-black uppercase tracking-wider text-sm">Notifications</h3>
                                    {hasAlarm && (
                                        <button
                                            onClick={clearAlarms}
                                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {alarms && alarms.length > 0 ? (
                                        alarms.map((alarm) => (
                                            <div key={alarm.id} className={`p-4 border-b last:border-0 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                                                <div className="flex gap-4">
                                                    <div className="mt-1"><AlertTriangle className="text-red-500" size={18} /></div>
                                                    <div>
                                                        <p className="text-sm font-bold uppercase">{alarm.sensor}</p>
                                                        <p className="text-xs opacity-70 mb-1">{alarm.message}</p>
                                                        <p className="text-[10px] font-mono opacity-40 uppercase">{alarm.time || 'JUST NOW'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center opacity-30 flex flex-col items-center">
                                            <Check size={48} className="mb-2" />
                                            <p className="font-bold uppercase text-xs tracking-widest">System All Clear</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🌗 Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-900/80 hover:bg-slate-800 text-yellow-400' : 'bg-white hover:bg-gray-100 text-slate-600'} shadow-xl active:scale-95`}
                    >
                        {isDarkMode ? <Sun size={32} /> : <Moon size={32} />}
                    </button>

                </header>

                <div className="flex-1 overflow-auto relative custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;