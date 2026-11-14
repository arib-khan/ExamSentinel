
// import axios from "axios";
// // import { toast } from "sonner";

// // Create an Axios instance

// const cloudClient = axios.create({
//   baseURL: import.meta.env.VITE_API_CLOUD_URL,
//   timeout: 50000,
// });

// // Request interceptor to attach the token
// cloudClient.interceptors.request.use(
//   (config) => {
//     const token = sessionStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle errors globally
// cloudClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // handle 401 Unauthorized
//     if (error.response?.status === 401) {
//       //   toast.error("Session expired. Please log in again.");
//       sessionStorage.removeItem("authToken");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default cloudClient;

import { getConfig } from "@/config";
import axios from "axios";

// Create an Axios instance
const cloudClient = axios.create({
  timeout: 50000,
});

// Dynamically set baseURL before each request
cloudClient.interceptors.request.use(
  (config) => {
    // Set baseURL from runtime config
    config.baseURL = getConfig('VITE_API_CLOUD_URL');
    
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
cloudClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // handle 401 Unauthorized
    if (error.response?.status === 401) {
      //   toast.error("Session expired. Please log in again.");
      sessionStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default cloudClient;