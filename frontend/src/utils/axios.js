import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',  // Your API base URL
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
