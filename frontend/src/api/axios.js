import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

axios.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken'); // Or from your state
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 axios.interceptors.response.use(
  (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
              // Make a request to your refresh token endpoint
              const response = await axios.get('/auth/refresh', {
                  // Include refresh token if not in an HTTP-only cookie
              });
              const newAccessToken = response.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken); // Or update your state

              // Update the original request with the new access token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              // Retry the original request
              return axios(originalRequest);
          } catch (refreshError) {
              // Handle refresh token failure (e.g., redirect to login)
              console.error('Refresh token failed:', refreshError);
              // Clear tokens and redirect to login
              localStorage.removeItem('accessToken');
              // navigate('/login'); // Example: using React Router's navigate
              return Promise.reject(refreshError);
          }
      }
    return Promise.reject(error);
  }
);
export default api;