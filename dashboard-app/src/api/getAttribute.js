import { useStore } from '../store/useStore';

const BASE_URL = 'http://localhost:8080';

/**
 * ดึง Server Attributes ทั้งหมดของ Asset ที่เลือกอยู่
 */
export const getAssetAttributes = async () => {
    const { token } = useStore.getState().auth;
    const { selectedAssetId } = useStore.getState();

    if (!selectedAssetId || !token) return null;

    try {
        const response = await fetch(
            `${BASE_URL}/api/plugins/telemetry/ASSET/${selectedAssetId}/values/attributes/SERVER_SCOPE`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) throw new Error('Failed to fetch attributes');

        const data = await response.json();

        // แปลงจาก [{key: 'k', value: 'v'}] เป็น { k: 'v' } เพื่อให้ใช้ง่ายใน UI
        const formattedAttributes = {};
        data.forEach(item => {
            formattedAttributes[item.key] = item.value;
        });

        return formattedAttributes;
    } catch (error) {
        console.error('Get Attribute Error:', error);
        return null;
    }
};