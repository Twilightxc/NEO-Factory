// src/api/device.js
import { useStore } from '../store/useStore';

const BASE_URL = 'http://localhost:8080';

/**
 * ดึงรายการ Device ทั้งหมดที่ผูกกับ Customer ID นี้
 */
export const getCustomerDevices = async (customerId) => {
  // ดึง Token จาก Zustand Store
  const token = useStore.getState().auth.token;

  try {
    const response = await fetch(
      `${BASE_URL}/api/customer/${customerId}/devices?page=0&pageSize=50`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }

    const data = await response.json();

    // data.data จะเป็น Array ของอุปกรณ์ทั้งหมด
    return data.data;
  } catch (error) {
    console.error('Device API Error:', error);
    return [];
  }
};