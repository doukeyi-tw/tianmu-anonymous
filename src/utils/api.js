import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  maxContentLength: 4 * 1024 * 1024,
  maxBodyLength: 4 * 1024 * 1024,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
