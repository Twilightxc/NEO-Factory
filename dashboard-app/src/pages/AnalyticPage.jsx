import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';
import analyticsApi from '../api/analyticsApi';
import { USE_SIMULATION, generateMockHistory } from '../utils/mockData';
import {
    Download, FileText, TrendingUp, Activity,
    Calendar, Filter, Loader2, AlertCircle, Zap, CheckCircle2,
    Database, FileDown, Layers, Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

const Analytics = () => {
    const isDarkMode = useStore((state) => state.isDarkMode);
    const { selectedDeviceId } = useStore();

    const [historyData, setHistoryData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    // 🕒 1. State สำหรับ วัน/เดือน/ปี/ชม./นาที (Dropdown ทั้งหมด)
    const now = new Date();
    const past = new Date(); past.setDate(now.getDate() - 7);

    const [startConfig, setStartConfig] = useState({
        day: past.getDate().toString().padStart(2, '0'),
        month: (past.getMonth() + 1).toString().padStart(2, '0'),
        year: past.getFullYear().toString(),
        hour: '00', minute: '00'
    });

    const [endConfig, setEndConfig] = useState({
        day: now.getDate().toString().padStart(2, '0'),
        month: (now.getMonth() + 1).toString().padStart(2, '0'),
        year: now.getFullYear().toString(),
        hour: now.getHours().toString().padStart(2, '0'),
        minute: now.getMinutes().toString().padStart(2, '0')
    });

    // 🎯 2. Threshold Logic: พิมพ์แล้วกด Enter [cite: 2026-02-24]
    const [threshold, setThreshold] = useState('40');
    const [tempThreshold, setTempThreshold] = useState('40');
    const [enableThreshold, setEnableThreshold] = useState(false);

    const [activeKeys, setActiveKeys] = useState({
        pressure_in: true, pressure_out: true, delta_pressure: true,
        air_flow: true, humidity: true
    });

    const keyConfig = {
        pressure_in: { label: 'Pressure In', color: '#3b82f6' },
        pressure_out: { label: 'Pressure Out', color: '#06b6d4' },
        delta_pressure: { label: 'Delta Pressure', color: '#f97316' },
        air_flow: { label: 'Air Flow', color: '#22c55e' },
        humidity: { label: 'Humidity', color: '#a855f7' }
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const years = Array.from({ length: 5 }, (_, i) => (now.getFullYear() - 2 + i).toString());
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const toggleKey = (key) => { setActiveKeys(prev => ({ ...prev, [key]: !prev[key] })); };

    const getTimestamp = (config) => {
        return new Date(`${config.year}-${config.month}-${config.day}T${config.hour}:${config.minute}:00`).getTime();
    };

    const fetchData = useCallback(async () => {
        if (!selectedDeviceId) return;
        setLoading(true); setError(null);
        try {
            const startTs = getTimestamp(startConfig);
            const endTs = getTimestamp(endConfig);

            if (USE_SIMULATION) {
                // 🧪 จำลองข้อมูลจำนวนมาก (200 จุด) เพื่อทดสอบ Performance [cite: 2025-10-27]
                const mock = generateMockHistory(selectedDeviceId, 200).map(p => ({
                    ...p, timestamp: new Date(p.fullDate).getTime()
                }));
                setChartData(mock);
                setHistoryData({ data_points: mock.length, downsampled: true });
            } else {
                const params = {
                    keys: 'pressure_in,pressure_out,delta_pressure,humidity,air_flow',
                    start_ts: startTs, end_ts: endTs,
                    threshold: enableThreshold ? parseFloat(threshold) : undefined,
                    downsample: false // 🟢 ดึงข้อมูลทั้งหมด (Raw Data) [cite: 2026-02-24]
                };
                const response = await analyticsApi.getHistory(selectedDeviceId, params);
                setHistoryData(response);
                if (response?.data) {
                    const timeMap = new Map();
                    response.data.forEach(keyData => {
                        keyData.values.forEach(point => {
                            if (!timeMap.has(point.timestamp)) timeMap.set(point.timestamp, { timestamp: point.timestamp });
                            timeMap.get(point.timestamp)[keyData.key] = point.value;
                        });
                    });
                    setChartData(Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp));
                }
            }
        } catch (err) { setError(err.message || 'API Error'); }
        finally { setLoading(false); }
    }, [selectedDeviceId, startConfig, endConfig, enableThreshold, threshold]);

    useEffect(() => { fetchData(); }, [selectedDeviceId, fetchData]);

    // ✅ ระบบดาวน์โหลดแยกประเภทไฟล์ (CSV & EXCEL เท่านั้น) [cite: 2025-10-27]
    const handleExport = async (format) => {
        if (!selectedDeviceId) return;
        const f = format.toLowerCase();
        setExporting(true);
        try {
            if (USE_SIMULATION) {
                const headers = "Date,Time,Pressure In,Pressure Out,Delta P,Air Flow,Humidity\n";
                const rows = chartData.map(d => `${new Date(d.timestamp).toLocaleString()},${d.pressure_in},${d.pressure_out},${d.delta_pressure},${d.air_flow},${d.humidity}`).join("\n");
                let mType = f === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';
                let ext = f === 'excel' ? 'xls' : 'csv';
                const blob = new Blob([headers + rows], { type: mType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `report_${selectedDeviceId}.${ext}`;
                document.body.appendChild(link); link.click();
                document.body.removeChild(link); window.URL.revokeObjectURL(url);
            } else {
                await analyticsApi.exportReport(f, selectedDeviceId, {
                    start_ts: getTimestamp(startConfig), end_ts: getTimestamp(endConfig),
                    threshold: enableThreshold ? parseFloat(threshold) : undefined
                });
            }
        } catch (err) { alert(`Export failed: ${err.message}`); }
        finally { setExporting(false); }
    };

    const currentMetrics = useMemo(() => {
        const latest = chartData.length > 0 ? chartData[chartData.length - 1] : {};
        const eff = latest.pressure_in > 0 ? (latest.pressure_out / latest.pressure_in) * 100 : 0;
        return { ...latest, efficiency: eff };
    }, [chartData]);

    const DateTimeSelectGroup = ({ label, config, setConfig }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black opacity-50 uppercase ml-2 flex items-center gap-1"><Clock size={10} /> {label}</label>
            <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-gray-50 border-gray-200 shadow-inner'}`}>
                <select value={config.day} onChange={e => setConfig({ ...config, day: e.target.value })} className="bg-transparent text-[11px] font-bold outline-none cursor-pointer">
                    {days.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                </select>
                <span className="opacity-20">/</span>
                <select value={config.month} onChange={e => setConfig({ ...config, month: e.target.value })} className="bg-transparent text-[11px] font-bold outline-none cursor-pointer">
                    {months.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                </select>
                <span className="opacity-20">/</span>
                <select value={config.year} onChange={e => setConfig({ ...config, year: e.target.value })} className="bg-transparent text-[11px] font-bold outline-none cursor-pointer">
                    {years.map(y => <option key={y} value={y} className="text-black">{y}</option>)}
                </select>
                <div className="w-[1px] h-4 bg-current opacity-10 mx-1" />
                <select value={config.hour} onChange={e => setConfig({ ...config, hour: e.target.value })} className="bg-transparent text-[11px] font-bold outline-none cursor-pointer">
                    {hours.map(h => <option key={h} value={h} className="text-black">{h}</option>)}
                </select>
                <span className="opacity-20">:</span>
                <select value={config.minute} onChange={e => setConfig({ ...config, minute: e.target.value })} className="bg-transparent text-[11px] font-bold outline-none cursor-pointer">
                    {minutes.map(m => <option key={m} value={m} className="text-black">{m}</option>)}
                </select>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen flex flex-col p-8 overflow-auto transition-all ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
            {USE_SIMULATION && <div className="bg-orange-500 text-white text-[10px] font-black py-1 px-4 mb-4 rounded-full w-fit uppercase tracking-widest animate-pulse shadow-lg">⚠️ SIMULATION MODE</div>}

            <header className="mb-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Analytics Center</h1>
                    <p className="text-lg font-bold opacity-80">NODE: {selectedDeviceId || '---'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(keyConfig).map(key => (
                        <button key={key} onClick={() => toggleKey(key)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${activeKeys[key] ? 'bg-blue-600 border-blue-600 text-white shadow-md' : `border-transparent ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-gray-400'}`}`}>
                            {activeKeys[key] && <CheckCircle2 size={14} />} {keyConfig[key].label}
                        </button>
                    ))}
                </div>
            </header>

            <section className={`p-5 rounded-[2.5rem] border mb-8 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex flex-wrap items-center gap-6">
                    <DateTimeSelectGroup label="Start Point" config={startConfig} setConfig={setStartConfig} />
                    <DateTimeSelectGroup label="End Point" config={endConfig} setConfig={setEndConfig} />
                    <div className="space-y-1 w-[130px]">
                        <label className="text-[10px] font-black opacity-50 uppercase ml-2 flex items-center gap-1"><Filter size={10} /> Alert Limit</label>
                        <div className={`flex gap-2 items-center h-[38px] px-3 rounded-xl border border-current/10`}>
                            <input type="checkbox" checked={enableThreshold} onChange={e => setEnableThreshold(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                            <input type="number" value={tempThreshold} onChange={(e) => setTempThreshold(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setThreshold(tempThreshold); e.target.blur(); } }} disabled={!enableThreshold} className="flex-1 bg-transparent text-xs font-bold outline-none border-0 w-full" placeholder="..." />
                        </div>
                    </div>
                    {historyData && (
                        <div className="flex items-center gap-6 px-2 border-l border-slate-700/20 pl-6">
                            <div className="flex flex-col text-center">
                                <span className="text-[9px] font-black opacity-40 uppercase mb-1 flex items-center gap-1"><Database size={10} /> Total Points</span>
                                <span className="text-sm font-black text-blue-500">{historyData.data_points.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                    <div className="ml-auto">
                        <button onClick={fetchData} disabled={loading} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg text-xs flex items-center gap-2 transition-transform active:scale-95">
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <Activity size={14} />} REFRESH DATA
                        </button>
                    </div>
                </div>
            </section>

            {/* ✅ ส่วนกราฟ: ปรับปรุงให้รองรับข้อมูลจำนวนมาก (Raw Data) [cite: 2025-10-27] */}
            <div className={`p-8 rounded-[3rem] border mb-10 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white shadow-md border-gray-100'}`}>
                <div className="w-full h-[480px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                            <XAxis
                                dataKey="timestamp"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                minTickGap={80} // 🟢 ป้องกันตัวอักษรซ้อนกันเมื่อจุดข้อมูลเยอะ [cite: 2025-10-27]
                                interval="preserveStartEnd"
                                axisLine={false} tickLine={false}
                            />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                labelFormatter={(l) => `📅 ${new Date(l).toLocaleDateString()} | 🕒 ${new Date(l).toLocaleTimeString()}`}
                                contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            {enableThreshold && <ReferenceLine y={parseFloat(threshold)} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `LIMIT: ${threshold}`, fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />}
                            {Object.entries(keyConfig).map(([key, config]) => activeKeys[key] && (
                                <Line
                                    key={key} type="monotone" dataKey={key} stroke={config.color} strokeWidth={2}
                                    dot={chartData.length < 60} // 🟢 ซ่อนจุดถ้าข้อมูลเยอะเกินไปเพื่อประสิทธิภาพ [cite: 2025-10-27]
                                    isAnimationActive={chartData.length < 300} // 🟢 ปิด Animation ถ้าข้อมูลมหาศาลเพื่อป้องกันเครื่องค้าง [cite: 2025-10-27]
                                    name={config.label}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <div className={`lg:col-span-4 p-8 rounded-[2.5rem] border flex flex-col justify-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
                    <div className="flex items-center gap-4 mb-4"><Zap className="text-yellow-500" /><h3 className="font-bold uppercase opacity-60 text-xs text-blue-500">System Efficiency</h3></div>
                    <div className={`text-7xl font-black tracking-tighter ${currentMetrics.efficiency >= 80 ? 'text-green-500' : 'text-red-500'}`}>
                        {currentMetrics.efficiency.toFixed(1)}<span className="text-2xl">%</span>
                    </div>
                </div>
                <div className={`lg:col-span-8 p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white shadow-sm'}`}>
                    <h3 className="font-bold mb-8 uppercase opacity-60 text-xs flex items-center gap-2"><Download size={14} /> Professional Reports</h3>
                    <div className="grid grid-cols-2 gap-6"> {/* ✅ ปรับเป็น 2 คอลัมน์เพราะตัด PDF ออก [cite: 2025-10-27] */}
                        {[
                            { id: 'CSV', label: 'CSV', icon: <FileText className="text-green-600" size={32} /> },
                            { id: 'EXCEL', label: 'EXCEL', icon: <Activity className="text-blue-500" size={32} /> }
                        ].map(item => (
                            <button
                                key={item.id} onClick={() => handleExport(item.id)} disabled={exporting}
                                className={`p-6 rounded-3xl border-2 font-black transition-all hover:border-blue-500 hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-gray-100 bg-gray-50'}`}
                            >
                                {exporting ? <Loader2 className="animate-spin mx-auto" /> : (
                                    <div className="flex flex-col items-center">
                                        {item.icon}
                                        <span className="text-3xl mt-3 block font-black tracking-widest uppercase">{item.label}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;