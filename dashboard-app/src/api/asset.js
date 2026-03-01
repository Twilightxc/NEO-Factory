import { useStore } from '../store/useStore';

const BASE_URL = 'http://localhost:8080';

/**
 * ดึงรายการ Assets ทั้งหมดของ Customer
 */
export const getCustomerAssets = async (customerId) => {
    const token = useStore.getState().auth.token;

    try {
        const response = await fetch(
            `${BASE_URL}/api/customer/${customerId}/assets?page=0&pageSize=50`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) throw new Error('Failed to fetch assets');

        const data = await response.json();
        // ThingsBoard ส่งข้อมูลกลับมาในรูปแบบ { data: [ { id: {id: "..."}, name: "..." }, ... ] }
        return data.data;
    } catch (error) {
        console.error('Asset API Error:', error);
        return [];
    }
};