const BASE_URL = 'http://localhost:8080';

/**
 * ฟังก์ชันสำหรับ Decode JWT Payload โดยรองรับอักขระพิเศษ (UTF-8)
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    const payload = decodeToken(data.token);

    if (!payload) throw new Error('Invalid Token Payload');

    // ส่งคืนข้อมูลทั้งหมดที่ต้องการ
    return {
      token: data.token,
      refreshToken: data.refreshToken,
      sub: payload.sub,
      exp: payload.exp,
      firstName: payload.firstName,
      lastName: payload.lastName,
      customerId: payload.customerId,
      userId: payload.userId, // แถมไว้ให้เผื่อต้องใช้ตามเดิม
    };
  } catch (error) {
    console.error('Auth Service Error:', error);
    throw error;
  }
};