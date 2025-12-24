import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
