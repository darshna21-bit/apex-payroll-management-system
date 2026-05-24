import api from './api';

const attendanceService = {
  // Get attendance logs
  getAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Record attendance
  logAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },
};

export default attendanceService;
