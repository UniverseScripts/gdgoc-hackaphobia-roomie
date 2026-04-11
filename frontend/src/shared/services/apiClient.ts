import axios from 'axios';

// The Gateway URI injected via the GitHub Actions CI pipeline
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

if (!API_GATEWAY_URL) {
  console.warn("API_GATEWAY_URL is undefined. Remote API resolution may fail.");
}

export const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// A lightweight Axios interceptor could be utilized here to inject JWTs for authenticated endpoints
apiClient.interceptors.request.use((config) => {
  // Extract Firebase JWT if present from Zustand or localStorage
  // const token = useAuthStore.getState().jwtToken;
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});
