import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
    Settings, AlertTriangle, Check, Save, Trash2,
    Mail, MessageCircleMore, Gauge, Droplets, Fan,
    Loader2
} from 'lucide-react';

const AlarmSettings = () => {
    // --- 1. Store State Management --- [cite: 2026-02-13]
    const isDarkMode = useStore((state) => state.isDarkMode);
    const hasAlarm = useStore((state) => state.hasAlarm);
    const alarms = useStore((state) => state.alarms);
    const clearAlarms = useStore((state) => state.clearAlarms);
    const storeThresholds = useStore((state) => state.thresholds);
    const updateThresholds = useStore((state) => state.updateThresholds);
    const storeSettings = useStore((state) => state.settings);
    const updateSettings = useStore((state) => state.updateSettings);

    // --- 2. Local State ---
    const [localThresholds, setLocalThresholds] = useState(storeThresholds || {});
    const [localSettings, setLocalSettings] = useState(storeSettings || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // 🚩 ซิงค์ข้อมูลจาก Store เมื่อมีการเปลี่ยนแปลงภายนอก [cite: 2025-10-27]
    useEffect(() => {
        if (storeThresholds) setLocalThresholds(storeThresholds);
        if (storeSettings) setLocalSettings(storeSettings);
    }, [storeThresholds, storeSettings]);

    /** * 🔍 3. Change Detection Logic (หัวใจใหม่ของปุ่ม) [cite: 2025-10-27]
     * ใช้ useMemo ตรวจสอบว่า Local State ต่างจาก Store หรือไม่
     */
    const hasChanges = useMemo(() => {
        const thresholdsChanged = JSON.stringify(localThresholds) !== JSON.stringify(storeThresholds);
        const settingsChanged = JSON.stringify(localSettings) !== JSON.stringify(storeSettings);
        return thresholdsChanged || settingsChanged;
    }, [localThresholds, storeThresholds, localSettings, storeSettings]);

    const getMetricIcon = (metric) => {
        const m = metric.toLowerCase();
        if (m.includes('pressure')) return <Gauge className="w-6 h-6 text-blue-500" />;
        if (m.includes('humidity')) return <Droplets className="w-6 h-6 text-cyan-500" />;
        if (m.includes('air')) return <Fan className="w-6 h-6 text-green-500" />;
        return <Settings className="w-6 h-6" />;
    };

    // --- 4. Action Handlers ---
    const handleThresholdChange = (metric, field, value) => {
        const val = value === '' ? '' : parseFloat(value);
        setLocalThresholds(prev => ({
            ...prev,
            [metric]: { ...prev[metric], [field]: val }
        }));
        setIsSaved(false);
    };

    const toggleNotification = (type, status) => {
        setLocalSettings(prev => ({
            ...prev,
            [type === 'line' ? 'notificationEnable' : 'emailEnable']: status
        }));
        setIsSaved(false);
    };

    const handleSaveSettings = async () => {
        // Validation [cite: 2025-10-27]
        for (const metric in localThresholds) {
            if (localThresholds[metric].min > localThresholds[metric].max) {
                alert(`Error: ${metric} min value cannot be higher than max.`);
                return;
            }
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // จำลองการบันทึก [cite: 2025-10-27]

        // อัปเดตลง Store จริง [cite: 2026-02-13]
        updateThresholds(localThresholds);
        updateSettings(localSettings);

        setIsSaving(false);
        setIsSaved(true); // โชว์สถานะ Success

        // แสดงผลว่า "บันทึกสำเร็จ" นาน 2.5 วินาที ก่อนที่ hasChanges จะกลับเป็น false อัตโนมัติ [cite: 2025-10-27]
        setTimeout(() => setIsSaved(false), 2500);
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-auto bg-transparent">
            <header className="mb-6">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Alarm Management</h1>
                <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Configuration & Preferences</p>
            </header>

            {/* 🟦 Action Bar - ปรับแต่งสีปุ่มตามสถานะใหม่ [cite: 2025-10-27] */}
            <div className="flex justify-end mb-8 sticky top-0 z-10 py-2">
                <button
                    onClick={handleSaveSettings}
                    // ปุ่มกดไม่ได้ถ้า: กำลังบันทึก หรือ บันทึกสำเร็จไปแล้ว หรือ ไม่มีความเปลี่ยนแปลง [cite: 2025-10-27]
                    disabled={isSaving || isSaved || !hasChanges}
                    className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 
                        ${isSaving ? 'bg-amber-500 cursor-wait' :
                            isSaved ? 'bg-green-600 cursor-default scale-105' :
                                hasChanges ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                                    'bg-slate-400 opacity-50 cursor-not-allowed' // สถานะสีเทา [cite: 2025-10-27]
                        } text-white`}
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        isSaved ? <Check className="w-6 h-6 animate-bounce" /> :
                            <Save className="w-6 h-6" />}

                    <span className="text-xl uppercase">
                        {isSaving ? 'Saving...' :
                            isSaved ? 'Saved Successfully!' :
                                'Save All Changes'}
                    </span>
                </button>
            </div>

            {/* ส่วน Notification Preferences (คงเดิม) */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 uppercase">Notification Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-3xl border flex items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                        <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                            <MessageCircleMore size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">LINE Notifications</h3>
                            <p className="text-slate-500 mb-4 text-sm">Real-time alerts via LINE Notify</p>
                            <div className="flex gap-2">
                                <button onClick={() => toggleNotification('line', true)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${localSettings.notificationEnable ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>Enabled</button>
                                <button onClick={() => toggleNotification('line', false)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!localSettings.notificationEnable ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>Disabled</button>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border flex items-center gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                        <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                            <Mail size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">Email Notifications</h3>
                            <p className="text-slate-500 mb-4 text-sm">Official alert reports via Email</p>
                            <div className="flex gap-2">
                                <button onClick={() => toggleNotification('email', true)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${localSettings.emailEnable ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>Enabled</button>
                                <button onClick={() => toggleNotification('email', false)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!localSettings.emailEnable ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>Disabled</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ส่วน System Thresholds (คงเดิม) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className={`lg:col-span-7 p-8 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Settings className="w-8 h-8" /></div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">System Thresholds</h2>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(localThresholds).map(([metric, config]) => (
                            <div key={metric} className={`p-6 rounded-3xl border-2 transition-colors ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    {getMetricIcon(metric)}
                                    <h3 className="text-xl font-black capitalize tracking-tight">{metric.replace(/([A-Z])/g, ' $1')}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase ml-1">Min Limit</p>
                                        <input type="number" value={config.min} onChange={(e) => handleThresholdChange(metric, 'min', e.target.value)}
                                            className={`w-full p-4 rounded-xl border-2 font-mono text-lg transition-all focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-500 uppercase ml-1">Max Limit</p>
                                        <input type="number" value={config.max} onChange={(e) => handleThresholdChange(metric, 'max', e.target.value)}
                                            className={`w-full p-4 rounded-xl border-2 font-mono text-lg transition-all focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200'}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Logs Side Panel (คงเดิม) */}
                <div className={`lg:col-span-5 p-8 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><AlertTriangle className="w-8 h-8" /></div>
                            <h2 className="text-2xl font-bold uppercase text-red-500">Active Logs</h2>
                        </div>
                        {hasAlarm && (
                            <button onClick={clearAlarms} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
                                <Trash2 size={24} />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {hasAlarm ? (
                            alarms.map((alarm) => (
                                <div key={alarm.id} className={`p-6 rounded-3xl border-l-[6px] border-red-500 shadow-sm ${isDarkMode ? 'bg-slate-800/40' : 'bg-red-50/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-red-600 uppercase text-sm">{alarm.sensor}</h4>
                                        <span className="text-[10px] font-mono opacity-50 uppercase">{alarm.time || new Date().toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-semibold opacity-90">{alarm.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center">
                                <Check className="w-20 h-20 mb-4 stroke-[3]" />
                                <p className="font-black text-xl uppercase tracking-[0.2em]">All Systems Clear</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlarmSettings;