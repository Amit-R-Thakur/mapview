// axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: ' "http://192.168.0.200:5100', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosInstance;
