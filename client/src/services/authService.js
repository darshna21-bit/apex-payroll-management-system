import api from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current session user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Clear local storage and log out
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;
