
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  'https://careerconnect-backend-a7ga.onrender.com/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !['/login', '/register'].includes(window.location.pathname)
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
