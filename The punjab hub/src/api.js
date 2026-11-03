
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ph_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 Unauthorized and user had a token, remove expired token
    if (error.response?.status === 401) {
      if (localStorage.getItem("ph_token")) {
        console.warn("Session expired or invalid authorization token. Clearing local storage.");
        localStorage.removeItem("ph_token");
        localStorage.removeItem("ph_user");
      }
    }
    return Promise.reject(error);
  }
);

export async function checkApiHealth() {
  try {
    const { data } = await api.get("/health");
    return {
      online: true,
      mode: data?.database?.mode || "Connected",
      uptime: data?.uptime,
      dbConnected: !!data?.database?.connected,
    };
  } catch (err) {
    return {
      online: false,
      error: err.message,
      mode: "Offline",
      dbConnected: false,
    };
  }
}

export default api;

