import axios from "axios";
import { readStoredAuth } from "../../utils/authStorage";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/$/,
    "",
  ),
});

API.interceptors.request.use((config) => {
  const { token } = readStoredAuth();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
