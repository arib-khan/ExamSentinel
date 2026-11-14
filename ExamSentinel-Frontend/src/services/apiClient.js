// import axios from "axios";
// // import { toast } from "sonner";

// // Create an Axios instance

// const apiClient = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   timeout: 50000,
// });

// // Request interceptor to attach the token
// apiClient.interceptors.request.use(
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
// apiClient.interceptors.response.use(
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

// export default apiClient;

import { getConfig } from "@/config";
import axios from "axios";
// import { toast } from "sonner";

// Create an Axios instance
const apiClient = axios.create({
  timeout: 50000,
});

// Dynamically set baseURL before each request
apiClient.interceptors.request.use(
  (config) => {
    // Set baseURL from runtime config
    config.baseURL = getConfig('VITE_API_BASE_URL');
    
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // handle 401 Unauthorized
    if (error.response?.status === 401) {
      //   toast.error("Session expired. Please log in again.");
      sessionStorage.removeItem("authToken");
      window.location.href = "/"; // Redirect to root of the components is / not to the login page
    }
    return Promise.reject(error);
  }
);

export default apiClient;