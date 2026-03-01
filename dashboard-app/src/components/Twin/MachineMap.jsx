import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calculateFlowSpeed } from '../../utils/utils';
import CardTelemetry from '../card/cardTelemetry';
import { Gauge, TrendingUp, TrendingDown, Droplet, Wind } from 'lucide-react';

const MachineMap = () => {
    const isDarkMode = useStore((state) => state.isDarkMode);
    const selectedDeviceId = useStore((state) => state.selectedDeviceId);
    const telemetryStore = useStore((state) => state.telemetry); // 🚩 จุดชี้เป็นชี้ตาย

    // 📊 2. Mapping ข้อมูลแบบ Real-time (ดึงจาก telemetry[id]) [cite: 2026-02-13]
    const currentTelemetry = useMemo(() =>
        telemetryStore[selectedDeviceId] || {},
        [telemetryStore, selectedDeviceId]
    );

    // 🔗 3. ดึงค่าเซ็นเซอร์จากข้อมูลที่ "ขยับจริง"
    const airFlow = currentTelemetry.air_flow || 0;
    const pressureIn = currentTelemetry.pressure_in || 0;
    const pressureOut = currentTelemetry.pressure_out || 0;

    // ⚡ 4. คำนวณความเร็วแอนิเมชัน (ข้อ 5)
    const flowDuration = calculateFlowSpeed(airFlow);
    const durationNum = parseFloat(flowDuration);
    const isStopped = !airFlow || durationNum <= 0 || isNaN(durationNum);

    // 🎨 5. Theme Colors
    const pipeColor = isDarkMode ? "#475569" : "#b3b3b3";
    const machineBodyColor = isDarkMode ? "#1e293b" : "#cccccc";
    const flowStrokeColor = isStopped ? (isDarkMode ? "#475569" : "#94a3b8") : (isDarkMode ? "#00e5ff" : "#0d75ecff");

    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
            <svg
                width="100%"
                height="100%"
                viewBox="400 360 3250 1400" //  (x, y, w, h)  
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl transition-all duration-500"
            >
                <defs>
                    <linearGradient id="swatch6">
                        <stop style={{ stopColor: '#33bbff', stopOpacity: 1 }} offset="0" />
                    </linearGradient>

                    <style>
                        {`
                            @keyframes flow-dash {
                                from { 
                                    stroke-dashoffset: 50; 
                                }
                                to { 
                                    stroke-dashoffset: 0; 
                                }
                            }
                            
                            .flow-animation {
                                stroke-dasharray: 30 20;
                                animation: flow-dash ${isStopped ? '0s' : flowDuration} linear infinite;
                            }
                            
                            .flow-inactive {
                                stroke-dasharray: 5 10;
                                opacity: 0.1;
                            }
                        `}
                    </style>
                </defs>

                {/* LAYER 4 - Pipes */}
                <g id="layer4">
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 1762.194,707.59315 -558.3786,-0.58348 -0.1717,19.32655 558.3724,1.24991 z"
                        id="in_dryer01"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 1773.5045,1410.6289 -571.8847,-0.5835 -0.1763,19.3266 571.8784,1.2499 z"
                        id="in_dryer02"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2501.7268,709.52466 -558.3786,-0.58348 -0.1717,19.32655 558.3724,1.24991 z"
                        id="out_dryer01"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2513.5105,1413.1169 -558.3786,-0.5835 -0.1717,19.3266 558.3724,1.2499 z"
                        id="out_dryer02"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2492.5156,1060.979 1.5987,371.2334 19.3271,0.064 -0.9323,-371.2311 z"
                        id="in_tank02"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2492.0035,709.52165 1.5987,344.20155 19.3271,0.06 -0.9323,-344.19946 z"
                        id="in_tank01"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2493.4944,1064.0871 1039.0186,0.5955 0.5099,-19.3264 -1039.0005,-1.2619 z"
                        id="line_tank"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 2671.7059,1052.4706 1.5987,130.9982 19.3271,0.031 -0.9323,-130.9976 z"
                        id="in_tankA"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 3101.4705,1057.6471 1.5987,130.9982 19.3271,0.031 -0.9323,-130.9976 z"
                        id="in_tankB"
                    />
                    <path
                        style={{ fill: pipeColor, strokeWidth: 30, strokeDasharray: 'none' }}
                        d="m 3525.1765,1045.5588 1.5987,133.2036 19.3271,0.031 -0.9323,-133.203 z"
                        id="in_tankC"
                    />
                </g>

                {/* LAYER 6 - Flow Animation */}
                <g id="layer6" style={{ display: 'inline', stroke: '#000000', strokeOpacity: 1 }}>
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.259,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 1207.0666,717.20412 549.1627,0.5315 v 0"
                        id="flow-in-dryer01"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.2696,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 1204.1507,1419.5901 561.0792,0.5209 v 0"
                        id="flow-in-dryer02"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.259,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 1948.7018,718.73793 549.1627,0.5315 v 0"
                        id="flow-out-dryer01"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.259,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 1953.8464,1422.2199 549.1627,0.5315 v 0"
                        id="flow-out-dryer02"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.2087,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 2502.4402,720.30425 0.1304,334.73055 v 0"
                        id="flow-in-tank01"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.2171,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 2504.2615,1418.0192 -1.3218,-358.1681 v 0"
                        id="flow-in-tank02"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 15.4964,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 2511.8446,1054.713 1023.6969,0.2939 v 0"
                        id="flow-line-tank"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 14.9359,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 2682.6188,1065.5712 0.4032,104.4479 v 0"
                        id="flow-in-tankA"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 14.9359,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 3112.2616,1066.8647 0.4032,104.4479 v 0"
                        id="flow-in-tankB"

                    />
                    <path
                        className={isStopped ? 'flow-inactive' : 'flow-animation'}
                        style={{
                            display: 'inline',
                            fill: 'none',
                            stroke: flowStrokeColor,
                            strokeWidth: 14.9416,
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeOpacity: isStopped ? 0.4 : 0.8
                        }}
                        d="m 3535.4391,1057.3914 0.3974,106.0294 v 0"
                        id="flow-in-tankC"

                    />
                </g>

                {/* LAYER 3 - Pumps */}
                <g id="layer3">
                    {/* Pump 01 */}
                    <g id="pump_01">
                        <path id="rect3" style={{ fill: machineBodyColor }} d="M 440.96936,488.18423 H 948.26102 V 971.51758 H 440.96936 Z" />
                        <path id="rect4" style={{ fill: '#333333', strokeWidth: 1.00114 }} d="M 948.26111,488.12106 H 1206.5945 V 971.51758 H 948.26111 Z" />
                        <path id="rect5" style={{ fill: '#ff9955', strokeWidth: 1.05993 }} d="m 948.26086,839.22589 h 94.79164 v 38.54167 h -94.79164 z" />
                        <path id="rect6" style={{ fill: '#ffffff' }} d="m 1000.2616,781.50031 h 7.3657 v 36.82847 h -7.3657 z" />
                        <path id="rect7" style={{ fill: '#ffffff', strokeWidth: 1.03078 }} d="m 1012.7831,808.01685 h 28.1737 v 11.04852 h -28.1737 z" />
                        <path id="rect8" style={{ fill: '#ffffff', strokeWidth: 1.09813 }} d="m 1016.4659,782.23688 h 9.5754 v 30.19935 h -9.5754 z" />
                        <path id="rect9" style={{ fill: '#ffffff' }} d="m 1032.6705,782.23688 h 8.1023 v 33.8822 h -8.1023 z" />
                        <path id="rect10" style={{ fill: '#ffffff' }} d="m 999.52502,760.13983 h 8.83888 v 10.31198 h -8.83888 z" />
                        <path id="rect11" style={{ fill: '#ffffff' }} d="m 1012.0465,760.13983 h 29.4628 v 9.57538 h -29.4628 z" />
                        <path id="rect12" style={{ fill: '#ffffff' }} d="m 1030.4608,735.09644 h 11.7851 v 33.88219 h -11.7851 z" />
                        <path id="rect13" style={{ fill: '#ffffff', strokeWidth: 1.03833 }} d="m 1015.7294,667.33203 h 25.4116 V 677.644 h -25.4116 z" />
                        <path id="rect14" style={{ fill: '#ffffff' }} d="m 998.78845,689.42914 h 8.83885 v 39.03818 h -8.83885 z" />
                        <path id="rect15" style={{ fill: '#ffffff', strokeWidth: 1.06403 }} d="m 1011.3099,718.15533 h 30.1993 v 10.31195 h -30.1993 z" />
                        <path id="rect16" style={{ fill: '#ffffff', strokeWidth: 1.01242 }} d="m 1029.7242,690.16571 h 11.7852 v 30.19935 h -11.7852 z" />
                        <path id="rect17" style={{ fill: '#ffffff', strokeWidth: 0.953463 }} d="m 1018.6757,690.16571 h 19.8874 v 7.3657 h -19.8874 z" />
                        <path id="rect18" style={{ fill: '#ffffff' }} d="m 1016.4659,690.16571 h 8.1022 v 14.73139 h -8.1022 z" />
                        <path id="rect19" style={{ fill: '#ff7f2a' }} d="m 999.52502,666.59546 h 11.04858 V 677.644 h -11.04858 z" />
                        <path id="rect20" style={{ fill: '#666666' }} d="m 672.21936,488.1842 h 17.70833 v 483.33335 h -17.70833 z" />
                        <path id="rect21" style={{ fill: '#333333' }} d="M 466.53442,874.91827 H 527.6697 V 932.3707 H 466.53442 Z" />
                        <path id="rect21-5" style={{ fill: '#333333' }} d="m 560.43225,875.02441 h 61.13527 v 57.45243 h -61.13527 z" />
                        <path id="rect22" style={{ fill: '#333333' }} d="m 457.63599,669.95508 h 43.75 v 31.77083 h -43.75 z" />
                        <path id="rect23" style={{ fill: '#333333', strokeWidth: 1.08793 }} d="m 502.42773,586.6217 h 80.72917 v 49.47917 h -80.72917 z" />
                        <path id="path23" style={{ fill: '#999999' }} d="m 642.53202,562.92383 a 4.9479165,4.9479165 0 0 1 -4.94791,4.94791 4.9479165,4.9479165 0 0 1 -4.94792,-4.94791 4.9479165,4.9479165 0 0 1 4.94792,-4.94792 4.9479165,4.9479165 0 0 1 4.94791,4.94792 z" />
                        <path id="path23-1" style={{ fill: '#999999' }} d="m 928.44853,562.15302 a 4.9479165,4.9479165 0 0 1 -4.94792,4.94791 4.9479165,4.9479165 0 0 1 -4.94792,-4.94791 4.9479165,4.9479165 0 0 1 4.94792,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,4.94792 z" />
                        <path id="path23-14" style={{ fill: '#999999' }} d="m 642.26103,893.88214 a 4.9479165,4.9479165 0 0 1 -4.94792,4.94792 4.9479165,4.9479165 0 0 1 -4.94792,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,4.94792 z" />
                        <path id="path23-16" style={{ fill: '#999999' }} d="m 923.55253,899.73633 a 4.9479165,4.9479165 0 0 1 -4.94792,4.94791 4.9479165,4.9479165 0 0 1 -4.94791,-4.94791 4.9479165,4.9479165 0 0 1 4.94791,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,4.94792 z" />
                        <path id="path23-18" style={{ fill: '#999999' }} d="m 986.65678,899.48633 a 4.9479165,4.9479165 0 0 1 -4.94792,4.94791 4.9479165,4.9479165 0 0 1 -4.94791,-4.94791 4.9479165,4.9479165 0 0 1 4.94791,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,4.94792 z" />
                        <path id="path23-5" style={{ fill: '#999999' }} d="m 986.51103,561.48633 a 4.9479165,4.9479165 0 0 1 -4.94792,4.94791 4.9479165,4.9479165 0 0 1 -4.94792,-4.94791 4.9479165,4.9479165 0 0 1 4.94792,-4.94792 4.9479165,4.9479165 0 0 1 4.94792,4.94792 z" />
                        <path id="rect24" style={{ fill: '#e6e6e6' }} d="m 513.36511,596.51752 h 22.91667 v 12.5 h -22.91667 z" />
                        <path id="rect25" style={{ fill: '#e6e6e6' }} d="m 505.55261,591.3092 h 73.95834 v 3.64584 h -73.95834 z" />
                        <path id="rect26" style={{ fill: '#ffe680' }} d="m 545.13599,625.16339 h 8.85416 v 6.25 h -8.85416 z" />
                        <path id="rect26-38" style={{ fill: '#aca793' }} d="m 557.38586,625.20502 h 8.85417 v 6.25 h -8.85417 z" />
                        <path id="rect26-3" style={{ fill: '#ff9955' }} d="m 570.07336,625.33002 h 8.85417 v 6.25 h -8.85417 z" />
                    </g>

                    {/* Pump 02 */}
                    <g id="pump_02">
                        <path id="rect3-7" style={{ fill: machineBodyColor }} d="m 438.91327,1183.8774 h 507.29166 v 483.3334 H 438.91327 Z" />
                        <path id="rect4-9" style={{ fill: '#333333', strokeWidth: 1.00114 }} d="m 946.20502,1183.8142 h 258.33338 v 483.3965 H 946.20502 Z" />
                        <path id="rect5-3" style={{ fill: '#ff9955', strokeWidth: 1.05993 }} d="m 946.20477,1534.9191 h 94.79163 v 38.5416 h -94.79163 z" />
                        <path id="rect6-1" style={{ fill: '#ffffff' }} d="m 998.20551,1477.9301 h 7.36569 v 36.8284 h -7.36569 z" />
                        <path id="rect7-9" style={{ fill: '#ffffff', strokeWidth: 1.02402 }} d="m 1010.727,1503.71 h 27.8055 v 11.0485 h -27.8055 z" />
                        <path id="rect8-8" style={{ fill: '#ffffff', strokeWidth: 1.09813 }} d="m 1014.4099,1477.9301 h 9.5754 v 30.1993 h -9.5754 z" />
                        <path id="rect9-6" style={{ fill: '#ffffff' }} d="m 1030.6145,1477.9301 h 8.1023 v 33.8822 h -8.1023 z" />
                        <path id="rect10-5" style={{ fill: '#ffffff' }} d="m 997.46893,1455.833 h 8.83887 v 10.312 h -8.83887 z" />
                        <path id="rect11-0" style={{ fill: '#ffffff' }} d="m 1009.9904,1455.833 h 29.4628 v 9.5754 h -29.4628 z" />
                        <path id="rect12-2" style={{ fill: '#ffffff' }} d="m 1028.4048,1430.7896 h 11.7851 v 33.8821 h -11.7851 z" />
                        <path id="rect13-8" style={{ fill: '#ffffff', strokeWidth: 1.05327 }} d="m 1013.6733,1363.0251 h 26.1482 v 10.312 h -26.1482 z" />
                        <path id="rect14-6" style={{ fill: '#ffffff' }} d="m 997.10065,1385.1223 h 8.83885 v 39.0382 h -8.83885 z" />
                        <path id="rect15-0" style={{ fill: '#ffffff', strokeWidth: 1.06403 }} d="m 1009.2538,1413.8485 h 30.1993 v 10.312 h -30.1993 z" />
                        <path id="rect16-2" style={{ fill: '#ffffff', strokeWidth: 1.01242 }} d="m 1027.6682,1385.8589 h 11.7851 v 30.1993 h -11.7851 z" />
                        <path id="rect17-4" style={{ fill: '#ffffff', strokeWidth: 0.953463 }} d="m 1016.6197,1385.8589 h 19.8874 v 7.3657 h -19.8874 z" />
                        <path id="rect18-8" style={{ fill: '#ffffff' }} d="m 1014.4099,1385.8589 h 8.1023 v 14.7314 h -8.1023 z" />
                        <path id="rect19-6" style={{ fill: '#ff7f2a' }} d="m 997.46893,1362.2886 h 11.04857 v 11.0485 h -11.04857 z" />
                        <path id="rect20-5" style={{ fill: '#666666' }} d="m 670.16327,1183.8773 h 17.70833 v 483.3334 h -17.70833 z" />
                        <path id="rect21-0" style={{ fill: '#333333' }} d="m 464.47833,1570.6115 h 61.13528 v 57.4524 h -61.13528 z" />
                        <path id="rect21-5-9" style={{ fill: '#333333' }} d="m 558.37616,1570.7175 h 61.13527 v 57.4525 h -61.13527 z" />
                        <path id="rect22-0" style={{ fill: '#333333' }} d="m 455.5799,1365.6482 h 43.75 v 31.7708 h -43.75 z" />
                        <path id="rect23-0" style={{ fill: '#333333', strokeWidth: 1.08793 }} d="m 500.37164,1282.3148 h 80.72917 v 49.4792 h -80.72917 z" />
                        <path id="path23-6" style={{ fill: '#999999' }} d="m 640.47593,1258.6169 a 4.9479165,4.9479165 0 0 1 -4.94791,4.948 4.9479165,4.9479165 0 0 1 -4.94792,-4.948 4.9479165,4.9479165 0 0 1 4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94791,4.9479 z" />
                        <path id="path23-1-1" style={{ fill: '#999999' }} d="m 926.39244,1257.8462 a 4.9479165,4.9479165 0 0 1 -4.94792,4.9479 4.9479165,4.9479165 0 0 1 -4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,4.9479 z" />
                        <path id="path23-14-3" style={{ fill: '#999999' }} d="m 640.20494,1589.5753 a 4.9479165,4.9479165 0 0 1 -4.94792,4.9479 4.9479165,4.9479165 0 0 1 -4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,4.9479 z" />
                        <path id="path23-16-8" style={{ fill: '#999999' }} d="m 921.49644,1595.4294 a 4.9479165,4.9479165 0 0 1 -4.94792,4.948 4.9479165,4.9479165 0 0 1 -4.94791,-4.948 4.9479165,4.9479165 0 0 1 4.94791,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,4.9479 z" />
                        <path id="path23-18-9" style={{ fill: '#999999' }} d="m 984.60069,1595.1794 a 4.9479165,4.9479165 0 0 1 -4.94792,4.948 4.9479165,4.9479165 0 0 1 -4.94792,-4.948 4.9479165,4.9479165 0 0 1 4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,4.9479 z" />
                        <path id="path23-5-3" style={{ fill: '#999999' }} d="m 984.45494,1257.1794 a 4.9479165,4.9479165 0 0 1 -4.94792,4.948 4.9479165,4.9479165 0 0 1 -4.94792,-4.948 4.9479165,4.9479165 0 0 1 4.94792,-4.9479 4.9479165,4.9479165 0 0 1 4.94792,4.9479 z" />
                        <path id="rect24-4" style={{ fill: '#e6e6e6' }} d="m 511.30902,1292.2107 h 22.91667 v 12.5 h -22.91667 z" />
                        <path id="rect25-4" style={{ fill: '#e6e6e6' }} d="m 503.49652,1287.0023 h 73.95834 v 3.6459 h -73.95834 z" />
                        <path id="rect26-6" style={{ fill: '#ffe680' }} d="m 543.0799,1320.8566 h 8.85416 v 6.25 h -8.85416 z" />
                        <path id="rect26-38-0" style={{ fill: '#aca793' }} d="m 555.32977,1320.8982 h 8.85417 v 6.25 h -8.85417 z" />
                        <path id="rect26-3-6" style={{ fill: '#ff9955' }} d="m 568.01727,1321.0232 h 8.85417 v 6.25 h -8.85417 z" />
                    </g>
                </g>

                {/* LAYER 5 - Filters */}
                <g id="layer5">
                    {/* Filter B_01 */}
                    <g id="filterB_01">
                        <path id="path26" style={{ fill: '#333333', strokeWidth: 0.535733 }} d="m 2325.2815,902.03503 a 37.510307,27.534952 0 0 1 -37.5103,27.53496 37.510307,27.534952 0 0 1 -37.5103,-27.53496 37.510307,27.534952 0 0 1 37.5103,-27.53495 37.510307,27.534952 0 0 1 37.5103,27.53495 z" />
                        <path id="rect27" style={{ fill: '#333333', strokeWidth: 0.579975 }} d="m 2250.0767,761.57892 h 75.1284 v 139.62167 h -75.1284 z" />
                        <path id="rect28" style={{ fill: '#333333', strokeWidth: 0.581184 }} d="m 2246.3057,740.44098 h 81.5752 v 21.69421 h -81.5752 z" />
                        <path id="rect29" style={{ fill: '#333333', strokeWidth: 0.557924 }} d="m 2242.5347,706.78717 h 88.6505 v 20.58168 h -88.6505 z" />
                        <path id="rect30" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 2330.9473,703.38214 h 4.0852 v 30.59439 h -4.0852 z" />
                        <path id="rect30-7" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 2239.9578,703.83899 h 4.0852 v 30.59439 h -4.0852 z" />
                        <path id="rect31" style={{ fill: '#333333', strokeWidth: 0.559664 }} d="m 2257.1968,700.3902 h 62.0154 v 18.35663 h -62.0154 z" />
                        <path id="rect32" style={{ fill: '#333333', strokeWidth: 0.573634 }} d="m 2250.0769,725.97821 h 75.4204 v 20.30355 h -75.4204 z" />
                        <path id="path33" style={{ fill: '#333333', strokeWidth: 0.567627 }} d="m 2309.9877,679.93066 a 22.154734,8.2048588 0 0 1 -22.1547,8.20486 22.154734,8.2048588 0 0 1 -22.1547,-8.20486 22.154734,8.2048588 0 0 1 22.1547,-8.20485 22.154734,8.2048588 0 0 1 22.1547,8.20485 z" />
                        <path id="rect33" style={{ fill: '#333333', strokeWidth: 0.563403 }} d="m 2265.6973,679.2522 h 44.2713 v 25.03177 h -44.2713 z" />
                        <path id="rect6-1-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2278.3594,817.27362 h 3.805 v 15.09849 h -3.805 z" />
                        <path id="rect7-9-3" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} d="m 2284.8279,828.44647 h 14.364 v 4.52954 h -14.364 z" />
                        <path id="rect8-8-5" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} d="m 2286.7305,817.87756 h 4.9465 v 12.38076 h -4.9465 z" />
                        <path id="rect9-6-9" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2295.1016,817.87756 h 4.1855 v 13.89061 h -4.1855 z" />
                        <path id="rect10-5-8" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2277.979,808.81848 h 4.566 v 4.22758 h -4.566 z" />
                        <path id="rect11-0-4" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2284.4473,808.81848 h 15.2201 v 3.9256 h -15.2201 z" />
                        <path id="rect12-2-0" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2293.96,798.55151 h 6.088 v 13.89061 h -6.088 z" />
                        <path id="rect13-8-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2286.3499,770.77026 h 12.1761 v 4.22758 h -12.1761 z" />
                        <path id="rect14-6-6" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2277.5984,779.52747 h 4.566 v 16.00439 h -4.566 z" />
                        <path id="rect5-3-3" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} d="m 2278.5122,837.67468 h 13.5128 v 47.8385 h -13.5128 z" />
                        <path id="rect15-0-3" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} d="m 2284.0669,791.6062 h 15.6006 v 4.22757 h -15.6006 z" />
                        <path id="rect16-2-6" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2293.5793,780.43335 h 6.0881 v 12.07879 h -6.0881 z" />
                        <path id="rect17-4-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2287.8718,779.82941 h 10.2736 v 3.32166 h -10.2736 z" />
                        <path id="rect18-8-5" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2286.7305,780.13135 h 4.1855 v 6.03939 h -4.1855 z" />
                        <path id="rect19-6-4" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} d="m 2277.979,770.46832 h 5.7075 v 4.52955 h -5.7075 z" />
                        <path id="rect34" style={{ fill: '#e6e6e6', strokeWidth: 0.567629 }} transform="matrix(0.99999867,-0.00163318,0.00208493,0.99999783,0,0)" d="m 2269.5313,682.76587 h 33.9391 v 21.13795 h -33.9391 z" />
                    </g>

                    {/* Filter A_02 */}
                    <g id="filterA_02">
                        <path id="path26-1" style={{ fill: '#333333', strokeWidth: 0.535733 }} d="m 1519.4401,1605.3362 a 37.510307,27.534952 0 0 1 -37.5103,27.5349 37.510307,27.534952 0 0 1 -37.5103,-27.5349 37.510307,27.534952 0 0 1 37.5103,-27.535 37.510307,27.534952 0 0 1 37.5103,27.535 z" />
                        <path id="rect27-6" style={{ fill: '#333333', strokeWidth: 0.579975 }} d="m 1444.2352,1464.8801 h 75.1285 v 139.6217 h -75.1285 z" />
                        <path id="rect28-5" style={{ fill: '#333333', strokeWidth: 0.581184 }} d="m 1440.4642,1443.7422 h 81.5753 v 21.6942 h -81.5753 z" />
                        <path id="rect29-7" style={{ fill: '#333333', strokeWidth: 0.557924 }} d="m 1436.6932,1410.0884 h 88.6506 v 20.5817 h -88.6506 z" />
                        <path id="rect30-5" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 1525.1058,1406.6833 h 4.0853 v 30.5944 h -4.0853 z" />
                        <path id="rect30-7-4" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 1434.1163,1407.1401 h 4.0853 v 30.5944 h -4.0853 z" />
                        <path id="rect31-1" style={{ fill: '#333333', strokeWidth: 0.559664 }} d="m 1451.3553,1403.6914 h 62.0154 v 18.3566 h -62.0154 z" />
                        <path id="rect32-2" style={{ fill: '#333333', strokeWidth: 0.573634 }} d="m 1444.2355,1429.2794 h 75.4204 v 20.3036 h -75.4204 z" />
                        <path id="path33-0" style={{ fill: '#333333', strokeWidth: 0.567627 }} d="m 1504.1463,1383.2318 a 22.154734,8.2048588 0 0 1 -22.1547,8.2049 22.154734,8.2048588 0 0 1 -22.1548,-8.2049 22.154734,8.2048588 0 0 1 22.1548,-8.2048 22.154734,8.2048588 0 0 1 22.1547,8.2048 z" />
                        <path id="rect33-0" style={{ fill: '#333333', strokeWidth: 0.563403 }} d="m 1459.8558,1382.5533 h 44.2714 v 25.0318 h -44.2714 z" />
                        <path id="rect6-1-1-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1472.5179,1520.5748 h 3.8051 v 15.0985 h -3.8051 z" />
                        <path id="rect7-9-3-4" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} d="m 1478.9865,1531.7477 h 14.3639 v 4.5295 h -14.3639 z" />
                        <path id="rect8-8-5-6" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} d="m 1480.889,1521.1787 h 4.9466 v 12.3808 h -4.9466 z" />
                        <path id="rect9-6-9-0" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1489.2601,1521.1787 h 4.1856 v 13.8906 h -4.1856 z" />
                        <path id="rect10-5-8-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1472.1376,1512.1196 h 4.566 v 4.2276 h -4.566 z" />
                        <path id="rect11-0-4-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1478.6058,1512.1196 h 15.2201 v 3.9256 h -15.2201 z" />
                        <path id="rect12-2-0-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1488.1185,1501.8527 h 6.0881 v 13.8906 h -6.0881 z" />
                        <path id="rect13-8-7-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1480.5084,1474.0714 h 12.1761 v 4.2276 h -12.1761 z" />
                        <path id="rect14-6-6-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1471.757,1482.8286 h 4.566 v 16.0044 h -4.566 z" />
                        <path id="rect5-3-3-7" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} d="m 1472.6708,1540.9758 h 13.5128 v 47.8385 h -13.5128 z" />
                        <path id="rect15-0-3-3" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} d="m 1478.2255,1494.9073 h 15.6006 v 4.2276 h -15.6006 z" />
                        <path id="rect16-2-6-3" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1487.7379,1483.7345 h 6.0881 v 12.0788 h -6.0881 z" />
                        <path id="rect17-4-1-5" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1482.0304,1483.1306 h 10.2736 v 3.3217 h -10.2736 z" />
                        <path id="rect18-8-5-9" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1480.889,1483.4325 h 4.1856 v 6.0394 h -4.1856 z" />
                        <path id="rect19-6-4-9" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} d="m 1472.1376,1473.7695 h 5.7075 v 4.5296 h -5.7075 z" />
                        <path id="rect34-8" style={{ fill: '#e6e6e6', strokeWidth: 0.567629 }} transform="matrix(0.99999867,-0.00163318,0.00208493,0.99999783,0,0)" d="m 1462.2253,1384.75 h 33.9392 v 21.138 h -33.9392 z" />
                    </g>

                    {/* Filter B_02 */}
                    <g id="filterB_02">
                        <path id="path26-6" style={{ fill: '#333333', strokeWidth: 0.535733 }} d="m 2331.1153,1605.9781 a 37.510307,27.534952 0 0 1 -37.5103,27.535 37.510307,27.534952 0 0 1 -37.5103,-27.535 37.510307,27.534952 0 0 1 37.5103,-27.5349 37.510307,27.534952 0 0 1 37.5103,27.5349 z" />
                        <path id="rect27-0" style={{ fill: '#333333', strokeWidth: 0.579975 }} d="m 2255.9104,1465.5221 h 75.1285 v 139.6217 h -75.1285 z" />
                        <path id="rect28-3" style={{ fill: '#333333', strokeWidth: 0.581184 }} d="m 2252.1394,1444.3842 h 81.5753 v 21.6942 h -81.5753 z" />
                        <path id="rect29-8" style={{ fill: '#333333', strokeWidth: 0.557924 }} d="m 2248.3684,1410.7303 h 88.6505 v 20.5817 h -88.6505 z" />
                        <path id="rect30-0" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 2336.781,1407.3253 h 4.0853 v 30.5944 h -4.0853 z" />
                        <path id="rect30-7-1" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 2245.7915,1407.7821 h 4.0853 v 30.5944 h -4.0853 z" />
                        <path id="rect31-2" style={{ fill: '#333333', strokeWidth: 0.559664 }} d="m 2263.0305,1404.3334 h 62.0154 v 18.3566 h -62.0154 z" />
                        <path id="rect32-5" style={{ fill: '#333333', strokeWidth: 0.573634 }} d="m 2255.9106,1429.9214 h 75.4204 v 20.3035 h -75.4204 z" />
                        <path id="path33-09" style={{ fill: '#333333', strokeWidth: 0.567627 }} d="m 2315.8215,1383.8738 a 22.154734,8.2048588 0 0 1 -22.1548,8.2048 22.154734,8.2048588 0 0 1 -22.1547,-8.2048 22.154734,8.2048588 0 0 1 22.1547,-8.2049 22.154734,8.2048588 0 0 1 22.1548,8.2049 z" />
                        <path id="rect33-4" style={{ fill: '#333333', strokeWidth: 0.563403 }} d="m 2271.531,1383.1953 h 44.2713 v 25.0318 h -44.2713 z" />
                        <path id="rect6-1-1-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2284.1931,1521.2168 h 3.805 v 15.0985 h -3.805 z" />
                        <path id="rect7-9-3-8" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} d="m 2290.6616,1532.3896 h 14.364 v 4.5296 h -14.364 z" />
                        <path id="rect8-8-5-3" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} d="m 2292.5642,1521.8207 h 4.9465 v 12.3807 h -4.9465 z" />
                        <path id="rect9-6-9-5" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2300.9353,1521.8207 h 4.1855 v 13.8906 h -4.1855 z" />
                        <path id="rect10-5-8-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2283.8127,1512.7616 h 4.5661 v 4.2276 h -4.5661 z" />
                        <path id="rect11-0-4-2" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2290.281,1512.7616 h 15.2201 v 3.9256 h -15.2201 z" />
                        <path id="rect12-2-0-0" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2299.7937,1502.4946 h 6.088 v 13.8906 h -6.088 z" />
                        <path id="rect13-8-7-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2292.1836,1474.7134 h 12.1761 v 4.2276 h -12.1761 z" />
                        <path id="rect14-6-6-6" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2283.4321,1483.4706 h 4.5661 v 16.0044 h -4.5661 z" />
                        <path id="rect5-3-3-4" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} d="m 2284.3459,1541.6178 h 13.5129 v 47.8385 h -13.5129 z" />
                        <path id="rect15-0-3-0" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} d="m 2289.9006,1495.5493 h 15.6007 v 4.2276 h -15.6007 z" />
                        <path id="rect16-2-6-6" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2299.4131,1484.3765 h 6.088 v 12.0788 h -6.088 z" />
                        <path id="rect17-4-1-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2293.7056,1483.7726 h 10.2735 v 3.3216 h -10.2735 z" />
                        <path id="rect18-8-5-8" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 2292.5642,1484.0745 h 4.1855 v 6.0394 h -4.1855 z" />
                        <path id="rect19-6-4-98" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} d="m 2283.8127,1474.4115 h 5.7076 v 4.5295 h -5.7076 z" />
                        <path id="rect34-4" style={{ fill: '#e6e6e6', strokeWidth: 0.567629 }} transform="matrix(0.99999867,-0.00163318,0.00208493,0.99999783,0,0)" d="m 2273.8975,1386.7174 h 33.9391 v 21.138 h -33.9391 z" />
                    </g>

                    {/* Filter A_01 */}
                    <g id="filterA_01">
                        <path id="path26-8" style={{ fill: '#333333', strokeWidth: 0.535733 }} d="m 1512.2895,901.9563 a 37.510307,27.534952 0 0 1 -37.5103,27.53495 37.510307,27.534952 0 0 1 -37.5103,-27.53495 37.510307,27.534952 0 0 1 37.5103,-27.53495 37.510307,27.534952 0 0 1 37.5103,27.53495 z" />
                        <path id="rect27-8" style={{ fill: '#333333', strokeWidth: 0.579975 }} d="m 1437.0846,761.50018 h 75.1285 v 139.62168 h -75.1285 z" />
                        <path id="rect28-0" style={{ fill: '#333333', strokeWidth: 0.581184 }} d="m 1433.3136,740.36224 h 81.5753 v 21.69422 h -81.5753 z" />
                        <path id="rect29-87" style={{ fill: '#333333', strokeWidth: 0.557924 }} d="m 1429.5426,706.70844 h 88.6505 v 20.58168 h -88.6505 z" />
                        <path id="rect30-78" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 1517.9552,703.30341 h 4.0853 v 30.59439 h -4.0853 z" />
                        <path id="rect30-7-3" style={{ fill: '#333333', strokeWidth: 0.567629 }} d="m 1426.9657,703.76025 h 4.0853 v 30.59439 h -4.0853 z" />
                        <path id="rect31-8" style={{ fill: '#333333', strokeWidth: 0.559664 }} d="m 1444.2047,700.31146 h 62.0154 v 18.35664 h -62.0154 z" />
                        <path id="rect32-3" style={{ fill: '#333333', strokeWidth: 0.573634 }} d="m 1437.0848,725.89948 h 75.4204 v 20.30354 h -75.4204 z" />
                        <path id="path33-7" style={{ fill: '#333333', strokeWidth: 0.567627 }} d="m 1496.9957,679.85193 a 22.154734,8.2048588 0 0 1 -22.1548,8.20486 22.154734,8.2048588 0 0 1 -22.1547,-8.20486 22.154734,8.2048588 0 0 1 22.1547,-8.20486 22.154734,8.2048588 0 0 1 22.1548,8.20486 z" />
                        <path id="rect33-1" style={{ fill: '#333333', strokeWidth: 0.563403 }} d="m 1452.7052,679.17346 h 44.2713 v 25.03178 h -44.2713 z" />
                        <path id="rect6-1-1-0" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1465.3673,817.19489 h 3.805 v 15.09848 h -3.805 z" />
                        <path id="rect7-9-3-7" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} d="m 1471.8358,828.36774 h 14.364 v 4.52953 h -14.364 z" />
                        <path id="rect8-8-5-34" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} d="m 1473.7384,817.79883 h 4.9465 v 12.38076 h -4.9465 z" />
                        <path id="rect9-6-9-9" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1482.1095,817.79883 h 4.1855 v 13.89061 h -4.1855 z" />
                        <path id="rect10-5-8-6" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1464.9869,808.73975 h 4.5661 v 4.22757 h -4.5661 z" />
                        <path id="rect11-0-4-5" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1471.4552,808.73975 h 15.2201 v 3.92559 h -15.2201 z" />
                        <path id="rect12-2-0-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1480.9679,798.47278 h 6.088 v 13.89061 h -6.088 z" />
                        <path id="rect13-8-7-0" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1473.3578,770.69153 h 12.1761 v 4.22757 h -12.1761 z" />
                        <path id="rect14-6-6-9" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1464.6063,779.44873 h 4.5661 v 16.00439 h -4.5661 z" />
                        <path id="rect5-3-3-9" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} d="m 1465.5201,837.59595 h 13.5129 v 47.8385 h -13.5129 z" />
                        <path id="rect15-0-3-6" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} d="m 1471.0748,791.52747 h 15.6006 v 4.22756 h -15.6006 z" />
                        <path id="rect16-2-6-8" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1480.5873,780.35461 h 6.088 v 12.07879 h -6.088 z" />
                        <path id="rect17-4-1-3" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1474.8798,779.75067 h 10.2735 v 3.32167 h -10.2735 z" />
                        <path id="rect18-8-5-4" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} d="m 1473.7384,780.05261 h 4.1855 v 6.0394 h -4.1855 z" />
                        <path id="rect19-6-4-8" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} d="m 1464.9869,770.38959 h 5.7076 v 4.52954 h -5.7076 z" />
                        <path id="rect34-49" style={{ fill: '#e6e6e6', strokeWidth: 0.567629 }} transform="matrix(0.99999867,-0.00163318,0.00208493,0.99999783,0,0)" d="m 1456.5411,681.35937 h 33.9392 v 21.13796 h -33.9392 z" />
                    </g>
                </g>

                {/* LAYER 1 - Dryers */}
                <g id="layer1">
                    {/* Dryer 01 */}
                    <g id="dryer_01">
                        <path id="rect1" style={{ fill: '#333333' }} d="m 1758.125,479.45071 h 188.5417 V 972.15903 H 1758.125 Z" />
                        <path id="rect6-1-1-5" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 504.6918,-1837.2559 h 3.80503 v 15.0985 h -3.80503 z" />
                        <path id="rect7-9-3-5" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} transform="rotate(89.831688)" d="m 511.16031,-1826.083 h 14.36397 v 4.5295 h -14.36397 z" />
                        <path id="rect8-8-5-1" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} transform="rotate(89.831688)" d="m 513.06287,-1836.6519 h 4.94654 v 12.3808 h -4.94654 z" />
                        <path id="rect9-6-9-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 521.43396,-1836.6519 h 4.18553 v 13.8907 h -4.18553 z" />
                        <path id="rect10-5-8-11" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 504.31143,-1845.7109 h 4.56604 v 4.2275 h -4.56604 z" />
                        <path id="rect11-0-4-52" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 510.77969,-1845.7109 h 15.22012 v 3.9256 h -15.22012 z" />
                        <path id="rect12-2-0-76" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 520.29236,-1855.978 h 6.08805 v 13.8906 h -6.08805 z" />
                        <path id="rect13-8-7-14" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 512.68225,-1883.7593 h 12.1761 v 4.2276 h -12.1761 z" />
                        <path id="rect14-6-6-2" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 503.93082,-1875.002 h 4.56603 v 16.0044 h -4.56603 z" />
                        <path id="rect5-3-3-3" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} transform="rotate(89.831688)" d="m 504.84464,-1816.8547 h 13.51281 v 47.8385 h -13.51281 z" />
                        <path id="rect15-0-3-2" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} transform="rotate(89.831688)" d="m 510.39932,-1862.9233 h 15.60062 v 4.2275 h -15.60062 z" />
                        <path id="rect16-2-6-2" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 519.91174,-1874.0962 h 6.08805 v 12.0788 h -6.08805 z" />
                        <path id="rect17-4-1-16" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 514.20422,-1874.7 h 10.27359 v 3.3217 h -10.27359 z" />
                        <path id="rect18-8-5-85" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 513.06287,-1874.3982 h 4.18553 v 6.0394 h -4.18553 z" />
                        <path id="rect19-6-4-7" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 504.31143,-1884.061 h 5.70755 v 4.5295 h -5.70755 z" />
                        <path id="rect2" style={{ fill: '#1a1a1a' }} d="m 1765.1116,561.36328 h 173.9583 v 180.20833 h -173.9583 z" />
                        <path id="rect2-2" style={{ fill: '#333333', strokeWidth: 0.922983 }} d="m 1772.0684,568.65393 h 159.9635 V 735.604 h -159.9635 z" />
                        <path id="rect35" style={{ fill: '#1a1a1a' }} d="m 1872.3562,603.98401 h 55.9793 v 86.91521 h -55.9793 z" />
                        <path id="path35" style={{ fill: '#ffff00', strokeWidth: 1.08972 }} d="m 1915.0771,669.53876 a 13.994822,13.258251 0 0 1 -13.9948,13.25825 13.994822,13.258251 0 0 1 -13.9948,-13.25825 13.994822,13.258251 0 0 1 13.9948,-13.25825 13.994822,13.258251 0 0 1 13.9948,13.25825 z" />
                        <path id="path36" style={{ fill: '#ff0000' }} d="m 1907.7114,669.5387 a 6.6291261,6.6291261 0 0 1 -6.6291,6.62912 6.6291261,6.6291261 0 0 1 -6.6292,-6.62912 6.6291261,6.6291261 0 0 1 6.6292,-6.62913 6.6291261,6.6291261 0 0 1 6.6291,6.62913 z" />
                        <path id="rect36" style={{ fill: '#999999' }} d="m 1876.0391,612.82281 h 48.6136 v 30.19936 h -48.6136 z" />
                        <path id="rect37" style={{ fill: '#00ff00' }} d="m 1881.9316,620.18854 h 19.8874 v 8.10226 h -19.8874 z" />
                        <path id="rect38" style={{ fill: '#0000ff' }} d="m 1887.8242,634.18335 h 33.1456 v 2.94628 h -33.1456 z" />
                        <path id="rect39" style={{ fill: '#0000ff' }} d="m 1906.9751,622.39825 h 13.2582 v 5.15599 h -13.2582 z" />
                        <path id="rect40" style={{ fill: '#1a1a1a' }} d="m 1789.8604,763.81958 h 20.6239 v 9.5754 h -20.6239 z" />
                        <path id="rect40-3" style={{ fill: '#1a1a1a' }} d="m 1891.1575,763.64874 h 20.6239 v 9.57541 h -20.6239 z" />
                    </g>

                    {/* Dryer 02 */}
                    <g id="dryer_02">
                        <path id="rect1-4" style={{ fill: '#333333' }} d="M 1768.5984,1173.9091 H 1957.14 v 492.7083 h -188.5416 z" />
                        <path id="rect6-1-1-5-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1199.178,-1845.6893 h 3.805 v 15.0985 h -3.805 z" />
                        <path id="rect7-9-3-5-1" style={{ fill: '#ffffff', strokeWidth: 0.471255 }} transform="rotate(89.831688)" d="m 1205.6465,-1834.5165 h 14.364 v 4.5296 h -14.364 z" />
                        <path id="rect8-8-5-1-3" style={{ fill: '#ffffff', strokeWidth: 0.50536 }} transform="rotate(89.831688)" d="m 1207.5491,-1845.0853 h 4.9465 v 12.3807 h -4.9465 z" />
                        <path id="rect9-6-9-7-8" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1215.9202,-1845.0853 h 4.1855 v 13.8906 h -4.1855 z" />
                        <path id="rect10-5-8-11-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1198.7976,-1854.1444 h 4.566 v 4.2276 h -4.566 z" />
                        <path id="rect11-0-4-52-4" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1205.2659,-1854.1444 h 15.2201 v 3.9256 h -15.2201 z" />
                        <path id="rect12-2-0-76-2" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1214.7786,-1864.4115 h 6.088 v 13.8906 h -6.088 z" />
                        <path id="rect13-8-7-14-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1207.1685,-1892.1927 h 12.1761 v 4.2275 h -12.1761 z" />
                        <path id="rect14-6-6-2-7" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1198.417,-1883.4354 h 4.566 v 16.0044 h -4.566 z" />
                        <path id="rect5-3-3-3-9" style={{ fill: '#ff9955', strokeWidth: 0.44585 }} transform="rotate(89.831688)" d="m 1199.3308,-1825.2882 h 13.5128 v 47.8385 h -13.5128 z" />
                        <path id="rect15-0-3-2-3" style={{ fill: '#ffffff', strokeWidth: 0.489667 }} transform="rotate(89.831688)" d="m 1204.8855,-1871.3568 h 15.6006 v 4.2276 h -15.6006 z" />
                        <path id="rect16-2-6-2-1" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1214.3979,-1882.5297 h 6.0881 v 12.0788 h -6.0881 z" />
                        <path id="rect17-4-1-16-9" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1208.6904,-1883.1334 h 10.2736 v 3.3216 h -10.2736 z" />
                        <path id="rect18-8-5-85-8" style={{ fill: '#ffffff', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1207.5491,-1882.8317 h 4.1855 v 6.0394 h -4.1855 z" />
                        <path id="rect19-6-4-7-6" style={{ fill: '#ff7f2a', strokeWidth: 0.460201 }} transform="rotate(89.831688)" d="m 1198.7976,-1892.4945 h 5.7076 v 4.5295 h -5.7076 z" />
                        <path id="rect2-5" style={{ fill: '#1a1a1a' }} d="m 1775.585,1255.8217 h 173.9583 V 1436.03 H 1775.585 Z" />
                        <path id="rect2-2-0" style={{ fill: '#333333', strokeWidth: 0.922983 }} d="m 1782.5417,1263.1122 h 159.9635 v 166.9501 h -159.9635 z" />
                        <path id="rect35-2" style={{ fill: '#1a1a1a' }} d="m 1882.8296,1298.4423 h 55.9793 v 86.9152 h -55.9793 z" />
                        <path id="path35-8" style={{ fill: '#ffff00', strokeWidth: 1.08972 }} d="m 1925.5505,1363.9971 a 13.994822,13.258251 0 0 1 -13.9948,13.2582 13.994822,13.258251 0 0 1 -13.9949,-13.2582 13.994822,13.258251 0 0 1 13.9949,-13.2583 13.994822,13.258251 0 0 1 13.9948,13.2583 z" />
                        <path id="path36-6" style={{ fill: '#ff0000' }} d="m 1918.1848,1363.9969 a 6.6291261,6.6291261 0 0 1 -6.6291,6.6292 6.6291261,6.6291261 0 0 1 -6.6292,-6.6292 6.6291261,6.6291261 0 0 1 6.6292,-6.6291 6.6291261,6.6291261 0 0 1 6.6291,6.6291 z" />
                        <path id="rect36-0" style={{ fill: '#999999' }} d="m 1886.5125,1307.2811 h 48.6135 v 30.1994 h -48.6135 z" />
                        <path id="rect37-2" style={{ fill: '#00ff00' }} d="m 1892.405,1314.6469 h 19.8874 v 8.1022 h -19.8874 z" />
                        <path id="rect38-4" style={{ fill: '#0000ff' }} d="m 1898.2976,1328.6416 h 33.1456 v 2.9463 h -33.1456 z" />
                        <path id="rect39-8" style={{ fill: '#0000ff' }} d="m 1917.4485,1316.8566 h 13.2582 v 5.156 h -13.2582 z" />
                        <path id="rect40-6" style={{ fill: '#1a1a1a' }} d="m 1800.3337,1458.2778 h 20.624 v 9.5754 h -20.624 z" />
                        <path id="rect40-3-5" style={{ fill: '#1a1a1a' }} d="m 1901.6309,1458.1071 h 20.6239 v 9.5754 h -20.6239 z" />
                    </g>
                </g>

                {/* LAYER 2 - Tanks */}
                <g id="layer2">
                    {/* Tank A */}
                    <g id="tankA" transform="matrix(1.3829416,0,0,1.5422948,-1013.7673,-521.95117)">
                        <path id="path40" style={{ fill: machineBodyColor, strokeWidth: 1.20135 }} d="m 2748.5463,1127.6262 a 74.100273,30.792126 0 0 1 -74.1003,30.7921 74.100273,30.792126 0 0 1 -74.1002,-30.7921 74.100273,30.792126 0 0 1 74.1002,-30.7921 74.100273,30.792126 0 0 1 74.1003,30.7921 z" />
                        <path id="path41" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 2689.4083,1139.4285 a 4.3602543,7.292872 0 0 1 -4.3602,7.2928 4.3602543,7.292872 0 0 1 -4.3603,-7.2928 4.3602543,7.292872 0 0 1 4.3603,-7.2929 4.3602543,7.292872 0 0 1 4.3602,7.2929 z" />
                        <path id="path40-1" style={{ fill: machineBodyColor, strokeWidth: 1.20476 }} d="m 2748.643,1523.5168 a 74.520706,30.792126 0 0 1 -74.5207,30.7922 74.520706,30.792126 0 0 1 -74.5207,-30.7922 74.520706,30.792126 0 0 1 74.5207,-30.7921 74.520706,30.792126 0 0 1 74.5207,30.7921 z" />
                        <path id="rect42" style={{ fill: machineBodyColor, strokeWidth: 1.08961 }} d="m 2600.0571,1124.8427 h 148.1085 v 396.8681 h -148.1085 z" />
                        <path id="rect43" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 2590.3118,1155.6348 h 168.0679 v 25.9302 h -168.0679 z" />
                        <path id="rect6-1-1-6" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1200.3691,-2677.3831 h 4.186 v 16.2506 h -4.186 z" />
                        <path id="rect7-9-3-1" style={{ fill: '#ffffff', strokeWidth: 0.512796 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1207.4854,-2665.3577 h 15.8021 v 4.8752 h -15.8021 z" />
                        <path id="rect8-8-5-5" style={{ fill: '#ffffff', strokeWidth: 0.549908 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1209.5784,-2676.7329 h 5.4418 v 13.3255 h -5.4418 z" />
                        <path id="rect9-6-9-4" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1218.7876,-2676.7329 h 4.6046 v 14.9505 h -4.6046 z" />
                        <path id="rect10-5-8-2" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1199.9507,-2686.4834 h 5.0232 v 4.5502 h -5.0232 z" />
                        <path id="rect11-0-4-0" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1207.0667,-2686.4834 h 16.744 v 4.2251 h -16.744 z" />
                        <path id="rect12-2-0-9" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1217.5317,-2697.5337 h 6.6976 v 14.9506 h -6.6976 z" />
                        <path id="rect13-8-7-73" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1209.1597,-2727.4348 h 13.3952 v 4.5502 h -13.3952 z" />
                        <path id="rect14-6-6-72" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1199.532,-2718.0095 h 5.0232 v 17.2256 h -5.0232 z" />
                        <path id="rect5-3-3-6" style={{ fill: '#ff9955', strokeWidth: 0.485152 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1200.5374,-2655.4253 h 14.8657 v 51.4889 h -14.8657 z" />
                        <path id="rect15-0-3-01" style={{ fill: '#ffffff', strokeWidth: 0.532831 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1206.6482,-2705.0088 h 17.1626 v 4.5502 h -17.1626 z" />
                        <path id="rect16-2-6-65" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1217.113,-2717.0342 h 6.6976 v 13.0005 h -6.6976 z" />
                        <path id="rect17-4-1-7" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1210.8341,-2717.6843 h 11.3022 v 3.5751 h -11.3022 z" />
                        <path id="rect18-8-5-5" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1209.5784,-2717.3594 h 4.6046 v 6.5003 h -4.6046 z" />
                        <path id="rect19-6-4-4" style={{ fill: '#ff7f2a', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1199.9507,-2727.7598 h 6.279 v 4.8752 h -6.279 z" />
                    </g>

                    {/* Tank B */}
                    <g id="tankB" transform="matrix(1.3829416,0,0,1.5422948,-1179.8812,-524.19594)">
                        <path id="path40-17" style={{ fill: machineBodyColor, strokeWidth: 1.20135 }} d="m 3177.3627,1128.156 a 74.100273,30.792126 0 0 1 -74.1002,30.7921 74.100273,30.792126 0 0 1 -74.1003,-30.7921 74.100273,30.792126 0 0 1 74.1003,-30.7921 74.100273,30.792126 0 0 1 74.1002,30.7921 z" />
                        <path id="path41-7" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 3118.225,1139.9583 a 4.3602543,7.292872 0 0 1 -4.3603,7.2928 4.3602543,7.292872 0 0 1 -4.3602,-7.2928 4.3602543,7.292872 0 0 1 4.3602,-7.2929 4.3602543,7.292872 0 0 1 4.3603,7.2929 z" />
                        <path id="path40-1-7" style={{ fill: machineBodyColor, strokeWidth: 1.20476 }} d="m 3177.4594,1524.0466 a 74.520706,30.792126 0 0 1 -74.5207,30.7922 74.520706,30.792126 0 0 1 -74.5207,-30.7922 74.520706,30.792126 0 0 1 74.5207,-30.7921 74.520706,30.792126 0 0 1 74.5207,30.7921 z" />
                        <path id="rect42-7" style={{ fill: machineBodyColor, strokeWidth: 1.08961 }} d="m 3028.8738,1125.3724 h 148.1085 v 396.8682 h -148.1085 z" />
                        <path id="rect43-3" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 3019.1284,1156.1646 h 168.068 v 25.9302 h -168.068 z" />
                        <path id="rect6-1-1-6-3" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1204.743,-3106.1792 h 4.186 v 16.2506 h -4.186 z" />
                        <path id="rect7-9-3-1-5" style={{ fill: '#ffffff', strokeWidth: 0.512796 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1211.8593,-3094.1538 h 15.8021 v 4.8752 h -15.8021 z" />
                        <path id="rect8-8-5-5-9" style={{ fill: '#ffffff', strokeWidth: 0.549908 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1213.9523,-3105.5291 h 5.4418 v 13.3255 h -5.4418 z" />
                        <path id="rect9-6-9-4-9" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1223.1617,-3105.5291 h 4.6046 v 14.9506 h -4.6046 z" />
                        <path id="rect10-5-8-2-8" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1204.3246,-3115.2793 h 5.0232 v 4.5502 h -5.0232 z" />
                        <path id="rect11-0-4-0-1" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1211.4406,-3115.2793 h 16.744 v 4.2251 h -16.744 z" />
                        <path id="rect12-2-0-9-8" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1221.9058,-3126.3296 h 6.6976 v 14.9506 h -6.6976 z" />
                        <path id="rect13-8-7-73-2" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1213.5336,-3156.2307 h 13.3952 v 4.5502 h -13.3952 z" />
                        <path id="rect14-6-6-72-6" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1203.9059,-3146.8054 h 5.0232 v 17.2256 h -5.0232 z" />
                        <path id="rect5-3-3-6-6" style={{ fill: '#ff9955', strokeWidth: 0.485152 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1204.9113,-3084.2212 h 14.8657 v 51.4889 h -14.8657 z" />
                        <path id="rect15-0-3-01-0" style={{ fill: '#ffffff', strokeWidth: 0.532831 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1211.0221,-3133.8049 h 17.1626 v 4.5501 h -17.1626 z" />
                        <path id="rect16-2-6-65-3" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1221.4871,-3145.8303 h 6.6976 v 13.0005 h -6.6976 z" />
                        <path id="rect17-4-1-7-8" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1215.208,-3146.4805 h 11.3022 v 3.5752 h -11.3022 z" />
                        <path id="rect18-8-5-5-0" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1213.9523,-3146.1553 h 4.6046 v 6.5003 h -4.6046 z" />
                        <path id="rect19-6-4-4-1" style={{ fill: '#ff7f2a', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1204.3246,-3156.5559 h 6.279 v 4.8752 h -6.279 z" />
                    </g>

                    {/* Tank C */}
                    <g id="tankC" transform="matrix(1.3829416,0,0,1.5422948,-1345.9952,-521.95115)">
                        <path id="path40-4" style={{ fill: machineBodyColor, strokeWidth: 1.20135 }} d="m 3606.3193,1126.1558 a 74.100273,30.792126 0 0 1 -74.1003,30.7921 74.100273,30.792126 0 0 1 -74.1003,-30.7921 74.100273,30.792126 0 0 1 74.1003,-30.7922 74.100273,30.792126 0 0 1 74.1003,30.7922 z" />
                        <path id="path41-78" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 3547.1813,1137.958 a 4.3602543,7.292872 0 0 1 -4.3603,7.2929 4.3602543,7.292872 0 0 1 -4.3602,-7.2929 4.3602543,7.292872 0 0 1 4.3602,-7.2929 4.3602543,7.292872 0 0 1 4.3603,7.2929 z" />
                        <path id="path40-1-3" style={{ fill: machineBodyColor, strokeWidth: 1.20476 }} d="m 3606.416,1522.0465 a 74.520706,30.792126 0 0 1 -74.5207,30.7921 74.520706,30.792126 0 0 1 -74.5207,-30.7921 74.520706,30.792126 0 0 1 74.5207,-30.7921 74.520706,30.792126 0 0 1 74.5207,30.7921 z" />
                        <path id="rect42-5" style={{ fill: machineBodyColor, strokeWidth: 1.08961 }} d="m 3457.8301,1123.3723 h 148.1085 v 396.8682 h -148.1085 z" />
                        <path id="rect43-1" style={{ fill: machineBodyColor, strokeWidth: 1.08815 }} d="m 3448.0847,1154.1644 h 168.068 v 25.9302 h -168.068 z" />
                        <path id="rect6-1-1-6-2" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1206.5884,-3535.137 h 4.186 v 16.2506 h -4.186 z" />
                        <path id="rect7-9-3-1-0" style={{ fill: '#ffffff', strokeWidth: 0.512796 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1213.7046,-3523.1116 h 15.8021 v 4.8752 h -15.8021 z" />
                        <path id="rect8-8-5-5-1" style={{ fill: '#ffffff', strokeWidth: 0.549908 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1215.7976,-3534.4868 h 5.4418 v 13.3255 h -5.4418 z" />
                        <path id="rect9-6-9-4-6" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1225.0068,-3534.4868 h 4.6046 v 14.9505 h -4.6046 z" />
                        <path id="rect10-5-8-2-4" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1206.1699,-3544.2373 h 5.0232 v 4.5502 h -5.0232 z" />
                        <path id="rect11-0-4-0-0" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1213.2859,-3544.2373 h 16.744 v 4.2251 h -16.744 z" />
                        <path id="rect12-2-0-9-6" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1223.751,-3555.2876 h 6.6976 v 14.9506 h -6.6976 z" />
                        <path id="rect13-8-7-73-1" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1215.3789,-3585.1887 h 13.3952 v 4.5501 h -13.3952 z" />
                        <path id="rect14-6-6-72-8" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1205.7512,-3575.7634 h 5.0232 v 17.2256 h -5.0232 z" />
                        <path id="rect5-3-3-6-9" style={{ fill: '#ff9955', strokeWidth: 0.485152 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1206.7565,-3513.1792 h 14.8657 v 51.4889 h -14.8657 z" />
                        <path id="rect15-0-3-01-8" style={{ fill: '#ffffff', strokeWidth: 0.532831 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1212.8674,-3562.7629 h 17.1626 v 4.5501 h -17.1626 z" />
                        <path id="rect16-2-6-65-4" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1223.3323,-3574.7883 h 6.6976 v 13.0005 h -6.6976 z" />
                        <path id="rect17-4-1-7-1" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1217.0532,-3575.4385 h 11.3022 v 3.5752 h -11.3022 z" />
                        <path id="rect18-8-5-5-4" style={{ fill: '#ffffff', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1215.7976,-3575.1133 h 4.6046 v 6.5003 h -4.6046 z" />
                        <path id="rect19-6-4-4-3" style={{ fill: '#ff7f2a', strokeWidth: 0.500768 }} transform="matrix(0.00858073,0.99996318,-0.99995982,0.00896472,0,0)" d="m 1206.1699,-3585.5137 h 6.279 v 4.8752 h -6.279 z" />
                    </g>
                </g>

                {/* ============ TELEMETRY CARDS LAYER - Spatial Mapping ============ */}
                <g id="telemetry_cards">
                    {/* 🔴 RED - Pressure In Dryer 01 (ทางเข้าบน) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="pressure_in"
                        label="Pressure IN"
                        unit="BAR"
                        threshold={45}
                        x={1325}
                        y={550}
                        icon={Gauge}
                        decimals={1}
                    />

                    {/* 🔴 RED - Pressure In Dryer 02 (ทางเข้าล่าง) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="pressure_in"
                        label="Pressure IN"
                        unit="BAR"
                        threshold={45}
                        x={1325}
                        y={1250}
                        icon={Gauge}
                        decimals={1}
                    />

                    {/* ⚪ WHITE - Delta Pressure Dryer 01 (บนเครื่องบน) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="delta_pressure"
                        label="Δ Pressure"
                        unit="BAR"
                        threshold={8}
                        x={1700}
                        y={350}
                        icon={TrendingUp}
                        decimals={1}
                    />

                    {/* ⚪ WHITE - Delta Pressure Dryer 02 (บนเครื่องล่าง) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="delta_pressure"
                        label="Δ Pressure"
                        unit="BAR"
                        threshold={8}
                        x={1700}
                        y={1050}
                        icon={TrendingUp}
                        decimals={1}
                    />

                    {/* 🟡 YELLOW - Pressure Out Dryer 01 (ทางออกบน) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="pressure_out"
                        label="Pressure OUT"
                        unit="BAR"
                        threshold={40}
                        x={2150}
                        y={540}
                        icon={Gauge}
                        decimals={1}
                    />

                    {/* 🟡 YELLOW - Pressure Out Dryer 02 (ทางออกล่าง) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="pressure_out"
                        label="Pressure OUT"
                        unit="BAR"
                        threshold={40}
                        x={2150}
                        y={1240}
                        icon={Gauge}
                        decimals={1}
                    />

                    {/* 🔵 BLUE - Humidity (ท่อรวมกลาง) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="humidity"
                        label="Humidity"
                        unit="%"
                        threshold={80}
                        x={2700}
                        y={925}
                        icon={Droplet}
                        decimals={0}
                    />

                    {/* 🟢 GREEN - Air Flow (ท่อเมนหลัก) */}
                    <CardTelemetry
                        deviceId={selectedDeviceId}
                        telemetryKey="air_flow"
                        label="Air Flow"
                        unit="M³/H"
                        threshold={250}
                        x={3040}
                        y={925}
                        icon={Wind}
                        decimals={0}
                    />
                </g>
            </svg>
        </div>
    );
};

export default MachineMap;