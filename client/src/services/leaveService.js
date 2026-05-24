import api from './api';

const leaveService = {
  // Get all leaves
  getLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  // Apply for leave (Employee only)
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  // Approve/reject leave (Admin only)
  updateLeaveStatus: async (id, status) => {
    const response = await api.put(`/leaves/${id}/status`, { status });
    return response.data;
  },
};

export default leaveService;
