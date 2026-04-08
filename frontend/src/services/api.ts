import axios from 'axios';

// 1. Define the Base URL
// Local: http://localhost:8000
// Cloud (Later): https://your-oracle-ip.com/api
const API_URL = 'https://fitnest-backend-7533.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (Auto-attach Tokens)
// This automatically grabs the JWT token from storage and sends it with every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') { // Check if running in browser
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
