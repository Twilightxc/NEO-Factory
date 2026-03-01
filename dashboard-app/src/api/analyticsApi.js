const API_BASE_URL = '/custom-api';

const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, value);
    });
    return searchParams.toString();
};

/**
 * 🚀 Enhanced Request Wrapper
 */
const request = async (endpoint, options = {}) => {
    const { timeout = 30000, ...customOptions } = options;

    // 🚩 รายละเอียดที่ 1: ระบบ Timeout [cite: 2025-10-27]
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, {
            ...customOptions,
            signal: controller.signal
        });
        clearTimeout(id); // ล้างคิวเมื่อทำงานเสร็จ

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
        }
        return response;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('Request Timeout (30s)');
        console.error('❌ API Error:', error.message);
        throw error;
    }
};

export const analyticsApi = {
    // 📊 ดึงข้อมูลประวัติ
    getHistory: async (deviceId, params = {}) => {
        const query = buildQueryString({
            device_id: deviceId,
            keys: params.keys || 'pressure_in,pressure_out,delta_pressure,humidity,air_flow',
            start_ts: params.start_ts,
            end_ts: params.end_ts,
            threshold: params.threshold,
            downsample: params.downsample !== false
        });
        const response = await request(`/analytics/history?${query}`);
        return await response.json();
    },

    // 📥 ส่งออกรายงาน (ครบถวนเรื่อง Blob และ Filename) [cite: 2026-02-24]
    exportReport: async (format, deviceId, params = {}) => {
        const query = buildQueryString({
            format: format.toLowerCase(),
            device_id: deviceId,
            keys: params.keys || 'pressure_in,pressure_out,delta_pressure,humidity,air_flow',
            start_ts: params.start_ts,
            end_ts: params.end_ts,
            threshold: params.threshold
        });

        const response = await request(`/analytics/export?${query}`);
        const blob = await response.blob();

        const contentDisposition = response.headers.get('content-disposition');
        let filename = `report_${deviceId}.${format}`;
        if (contentDisposition?.includes('filename=')) {
            filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    // 🚩 รายละเอียดที่ 2: Health Checks [cite: 2026-02-24]
    checkHealth: async () => {
        const response = await request('/health');
        return await response.json();
    }
};

export default analyticsApi;