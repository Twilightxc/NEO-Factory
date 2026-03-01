import { useStore } from '../store/useStore';

const BASE_URL = 'http://localhost:8080';

/**
 * อัปเดต Server Attributes สำหรับ Asset ที่เลือกอยู่
 * @param {Object} attributeData - ข้อมูลที่จะส่ง (channelAccessToken, targetId, email, etc.)
 */
export const postAssetAttributes = async (attributeData) => {
    // ดึงค่าล่าสุดจาก Zustand Store
    const { token } = useStore.getState().auth;
    const { selectedAssetId } = useStore.getState();

    // ป้องกันกรณีไม่มี ID หรือ Token
    if (!selectedAssetId) throw new Error('No Asset ID selected');
    if (!token) throw new Error('No Auth Token found');

    try {
        const response = await fetch(
            `${BASE_URL}/api/plugins/telemetry/ASSET/${selectedAssetId}/SERVER_SCOPE`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(attributeData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update attributes: ${errorText}`);
        }

        // ThingsBoard มักไม่คืนข้อมูล (200 OK เปล่าๆ) หากสำเร็จ
        return true;
    } catch (error) {
        console.error('Post Attribute Error:', error);
        throw error;
    }
};