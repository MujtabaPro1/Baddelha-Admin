import axiosInstance from '../service/api';
import { AxiosError } from 'axios';

// Store the logout function reference
let logoutFn: (() => void) | null = null;

// Function to set the logout function from AuthContext
export const setLogoutFunction = (fn: () => void) => {
  logoutFn = fn;
};

// Setup the response interceptor to handle 401 errors
export const setupAuthInterceptor = () => {
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      // Check if the error is a 401 Unauthorized
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized access detected, logging out...');
        
        // Call the logout function if it's available
        if (logoutFn) {
          logoutFn();
        } else {
          // Fallback if logout function is not set
          localStorage.removeItem('baddelha_user');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          // Redirect to login page
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};
