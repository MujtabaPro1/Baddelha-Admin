import axios from 'axios';

const isDevelop = false;
const PROD_BASE_URL = 'https://service.baddelha.com.sa/api/';
const STG_NEW = 'https://stg-service.baddelha.com.sa/api';
const BASE_URL = isDevelop ? STG_NEW : PROD_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 100000, // 10 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
  
export default axiosInstance;
