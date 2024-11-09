// frontend/src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api", // Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
