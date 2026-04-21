import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  // --- BEST PRACTICE IMPROVEMENT ---
  // Vite, which is common in modern React projects, uses the "VITE_" prefix for environment variables.
  // Make sure your .env file has: VITE_API_URL="http://localhost:3001/api"
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// This part is correct and remains the same.
// It runs BEFORE every request is sent.
api.interceptors.request.use(
  (config) => {
    if (config.url.startsWith('/admin')) {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This is the corrected global error handler.
// It runs AFTER every response is received.
api.interceptors.response.use(
  // The first function handles successful responses. We don't need to do anything.
  (response) => response,
  
  // The second function handles ALL failed responses.
  (error) => {
    // We specifically check if the error was a '401 Unauthorized'.
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config ? error.config.url : '';
      
      // Only do the admin logout and redirect if the request was to an admin route
      if (requestUrl.includes('/admin')) {
        localStorage.removeItem('admin_token');
        toast.error("Your admin session has expired. Please log in again.");
        window.location.href = '/admin/login';
      } else {
        // For customer-facing 401 errors, we might want to trigger a clerk refresh or just let the app handle it locally
        // toast.error("Session expired, please log in again.");
        console.warn("Customer API throw 401 Unauthorized", requestUrl);
      }
    }

    // For any other error (like a 500 or 404), we let the component's own
    // .catch() block handle it, so we pass the error along.
    return Promise.reject(error);
  }
);

export default api;