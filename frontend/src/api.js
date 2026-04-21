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
      // This block will now execute correctly without crashing.
      
      // 1. Remove the expired token.
      localStorage.removeItem('admin_token');
      
      // 2. Inform the user clearly.
      toast.error("Your session has expired. Please log in again.");

      // 3. Force a redirect to the login page to re-authenticate.
      window.location.href = '/admin/login';
    }

    // For any other error (like a 500 or 404), we let the component's own
    // .catch() block handle it, so we pass the error along.
    return Promise.reject(error);
  }
);

export default api;