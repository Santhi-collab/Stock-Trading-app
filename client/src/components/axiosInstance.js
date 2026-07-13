import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if present) to every outgoing request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('sbstocks_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected anywhere, clear it so the app falls back to the
// logged-out state instead of getting stuck retrying with a dead token.
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sbstocks_token');
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
