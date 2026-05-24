const API_BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : 'https://apex-payroll-management-system.onrender.com/api';// Fallback for standard environments, else uses proxy

import axios from 'axios';

// Initialize Axios instance
const api = axios.create({
  baseURL: API_BASE_URL, // Leverages Vite proxy in local dev, resolves relatively in deployment
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch expired or unauthorized tokens and log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are not already on the login page, and it is NOT a login/auth request, redirect
      const url = error.config && error.config.url ? error.config.url.toLowerCase() : '';
      const isAuthRequest = url.includes('login') || url.includes('register') || url.includes('auth');
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (!isAuthRequest && !isLoginPage) {
        window.location.href = '/login?error=access_removed';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
