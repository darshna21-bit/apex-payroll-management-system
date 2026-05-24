import api from './api';

const payrollService = {
  // Get all payrolls
  getPayrolls: async (params = {}) => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },

  // Get payroll by ID
  getPayrollById: async (id) => {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  // Generate payroll for a employee (Admin only)
  generatePayroll: async (payrollData) => {
    const response = await api.post('/payroll/generate', payrollData);
    return response.data;
  },

  // Process payment / pay salary (Admin only)
  payPayroll: async (id) => {
    const response = await api.put(`/payroll/${id}/pay`);
    return response.data;
  },

  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/payroll/stats');
    return response.data;
  },
};

export default payrollService;
