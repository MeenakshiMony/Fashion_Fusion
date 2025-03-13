import axios from 'axios';

const instance = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8080'  // Local development
    : 'https://d019-111-92-45-20.ngrok-free.app',  // Network IP for mobile access
});

// Attach the JWT token to the header for every request (if available)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
