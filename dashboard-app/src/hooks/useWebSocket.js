import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useStore } from '../store/useStore';

const BASE_URL = 'localhost:8080';
const WS_URL = `ws://${BASE_URL}/api/ws/plugins/telemetry`;

export const useTelemetryWebSocket = () => {
    const { token } = useStore((state) => state.auth);
    const deviceId = useStore((state) => state.selectedDeviceId);
    const updateTelemetry = useStore((state) => state.updateTelemetry);
    const setGlobalAlarm = useStore((state) => state.setGlobalAlarm);

    const socketUrl = token ? `${WS_URL}?token=${token}` : null;

    const { sendMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
        onOpen: () => console.log('✅ Connected to ThingsBoard WebSocket'),
        onClose: () => console.log('❌ Disconnected from ThingsBoard WebSocket'),
        shouldReconnect: () => true,
        reconnectInterval: 3000,
    });

    // 1. ส่งคำสั่ง Subscribe ทั้ง Telemetry และ Alarms
    useEffect(() => {
        if (readyState === 1 && deviceId) {
            const subscribeCmd = {
                tsSubCmds: [
                    {
                        entityType: 'DEVICE',
                        entityId: deviceId,
                        scope: 'LATEST_TELEMETRY',
                        cmdId: 10,
                    },
                ],
                // 🚨 เพิ่มการ Subscribe ข้อมูล Alarm ของอุปกรณ์นี้
                alarmDataCmds: [
                    {
                        cmdId: 20,
                        query: {
                            entityFilter: {
                                type: 'singleEntity',
                                singleEntity: { entityType: 'DEVICE', id: deviceId }
                            },
                            pageLink: {
                                pageSize: 1,
                                sortOrder: { key: { type: 'ALARM_FIELD', key: 'createdTime' }, direction: 'DESC' }
                            },
                            alarmFilter: {
                                statusList: ['ACTIVE_UNACK', 'ACTIVE_ACK'] // สนใจเฉพาะที่ยังไม่เคลียร์
                            }
                        }
                    }
                ]
            };
            sendMessage(JSON.stringify(subscribeCmd));
        }
    }, [readyState, deviceId, sendMessage]);

    // 2. จัดการข้อมูลที่ได้รับกลับมา
    useEffect(() => {
        if (!lastJsonMessage) return;

        // --- กรณีที่ 1: ข้อมูล Telemetry (ตัวเลข) ---
        if (lastJsonMessage.data) {
            const rawData = lastJsonMessage.data;
            const formattedData = {};
            Object.keys(rawData).forEach((key) => {
                formattedData[key] = rawData[key][0][1];
            });
            updateTelemetry(deviceId, formattedData);
        }

        // --- กรณีที่ 2: ข้อมูล Alarm (การแจ้งเตือน) ---
        // ตรวจสอบจากโครงสร้าง alarmData ของ ThingsBoard
        if (lastJsonMessage.alarmData) {
            const alarms = lastJsonMessage.alarmData.data || [];
            // ถ้ามีรายการ Alarm ที่สถานะเป็น Active ให้ตั้งค่า Global Alarm เป็น true
            const hasActiveAlarm = alarms.length > 0;
            setGlobalAlarm(hasActiveAlarm);

            if (hasActiveAlarm) {
                console.warn(`🚨 Alert: Active Alarm detected for device ${deviceId}`);
            }
        }
    }, [lastJsonMessage, updateTelemetry, setGlobalAlarm, deviceId]);

    return { readyState };
};