import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Firebase token
apiClient.interceptors.request.use(
  async (config) => {
    // Get Firebase ID token for all API requests
    const { auth } = await import("../config/firebase");
    const fbUser = auth.currentUser;
    
    if (fbUser) {
      try {
        const idToken = await fbUser.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
      } catch (error) {
        console.error("Failed to get Firebase ID token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Firebase token expired or invalid
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    
    // Handle network errors gracefully
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend server not available, using fallback data');
      // Don't reject the promise, let components handle fallback data
      return Promise.reject({ 
        ...error, 
        isNetworkError: true,
        message: 'Network Error - Backend server not running'
      });
    }
    
    return Promise.reject(error);
  },
);

export default apiClient;
