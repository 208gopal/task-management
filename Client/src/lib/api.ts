import axios from 'axios';

// Always use Vite proxy in dev to avoid CORS; in prod, allow override
const baseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api');

export const api = axios.create({
  baseURL,
  withCredentials: false,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;


