import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { USE_SIMULATION, MOCK_DEVICES, getSimulatedTelemetry } from '../utils/mockData';

export const useStore = create(
  persist(
    (set, get) => ({
      // 🔐 1. Authentication State
      auth: {
        token: null,
        refreshToken: null,
        sub: null,
        exp: null,
        firstName: "Neo",
        lastName: "Officer",
        customerId: null,
        userId: null,
        isAuthenticated: USE_SIMULATION,
      },

      // 📟 2. Device Management
      devices: USE_SIMULATION ? MOCK_DEVICES : [],
      selectedDeviceId: USE_SIMULATION ? MOCK_DEVICES[0].id.id : null,
      selectedAssetId: null,

      // 📊 3. Telemetry & Alarms State
      telemetry: {},
      hasAlarm: false,
      alarmCount: 0,
      alarms: [],

      // ⚙️ 4. UI State
      isDarkMode: true,
      isSidebarCollapsed: false,

      // 🚩 🚩 5. Thresholds & Notification Settings (ส่วนที่มีการอัปเดต)
      thresholds: {
        PressureIn: { min: 5, max: 12, enabled: true },
        PressureOut: { min: 5, max: 12, enabled: true },
        Humidity: { min: 30, max: 60, enabled: true },
        Airflow: { min: 100, max: 300, enabled: true },
      },

      settings: {
        email: '',
        apiThreshold: 0,
        notificationEnable: false,
        emailEnable: false, // 🚩 เพิ่มเติมเพื่อแยกสถานะ Email
        channelAccessToken: '',
        targetId: '',
        lastUpdateTs: null
      },

      // --- 🛠️ Actions Section ---

      setAuth: (authData) => set({
        auth: { ...authData, isAuthenticated: !!authData.token }
      }),

      setDevices: (deviceList) => set({
        devices: USE_SIMULATION ? MOCK_DEVICES : deviceList
      }),

      setSelectedDevice: (id) => set({ selectedDeviceId: id }),

      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // 🚩 Action สำหรับรับข้อมูลเริ่มต้นจาก API
      setSettingsFromApi: (apiDataArray) => {
        if (!Array.isArray(apiDataArray)) return;

        const updates = {};
        apiDataArray.forEach(item => {
          if (item.key === 'email') updates.email = item.value;
          if (item.key === 'threshold') updates.apiThreshold = item.value;
          if (item.key === 'notificationEnable') updates.notificationEnable = item.value;
          if (item.key === 'channelAccessToken') updates.channelAccessToken = item.value;
          if (item.key === 'targetId') updates.targetId = item.value;
          updates.lastUpdateTs = item.lastUpdateTs;
        });

        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      /**
       * 💾 🚩 NEW ACTIONS: สำหรับปุ่ม Save All Changes
       */
      // อัปเดตค่า Thresholds ทั้งหมดลง Store
      updateThresholds: (newThresholds) => set({ thresholds: newThresholds }),

      // อัปเดตการตั้งค่าแจ้งเตือน (Email/Line) ลง Store
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      updateTelemetry: (deviceId, newData) => set((state) => ({
        telemetry: {
          ...state.telemetry,
          [deviceId]: {
            ...(state.telemetry[deviceId] || {}),
            ...newData
          }
        }
      })),

      runSimulationStep: () => {
        if (!USE_SIMULATION) return;
        const { devices } = get();
        devices.forEach(device => {
          const id = device.id.id || device.id;
          get().updateTelemetry(id, getSimulatedTelemetry(id));
        });
      },

      clearAlarms: () => set({ alarms: [], hasAlarm: false, alarmCount: 0 }), // 🚩 เพิ่มเติมเพื่อให้ปุ่ม Trash ทำงานได้

      logout: () => {
        localStorage.removeItem('neo-factory-storage');
        set({
          auth: { token: null, isAuthenticated: false },
          devices: USE_SIMULATION ? MOCK_DEVICES : [],
          telemetry: {},
          hasAlarm: false,
          settings: { email: '', notificationEnable: false }
        });
      },
    }),
    {
      name: 'neo-factory-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: state.auth,
        selectedDeviceId: state.selectedDeviceId,
        isDarkMode: state.isDarkMode,
        isSidebarCollapsed: state.isSidebarCollapsed,
        thresholds: state.thresholds, // 🚩 บันทึกลง LocalStorage อัตโนมัติ
        settings: state.settings,    // 🚩 บันทึกลง LocalStorage อัตโนมัติ
      }),
    }
  )
);