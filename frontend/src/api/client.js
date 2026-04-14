import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://intelligent-yolo-backend-m5ef.onrender.com',
});

// REQUEST INTERCEPTOR: Inject Token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 Session expired or unauthorized. Clearing local state.');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // We don't force redirect here to allow components to handle it gracefully
    }
    return Promise.reject(error);
  }
);

export default api;
