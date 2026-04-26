/**
 * Centralized API Service
 *
 * This file handles:
 * - Axios instance creation with base configuration
 * - JWT token injection in request headers
 * - Global error handling and response interception
 * - All API endpoint wrappers
 * - Environment variable management
 *
 * ✅ Single source of truth for all API requests
 * ✅ Automatic authentication token attachment
 * ✅ Global error handling (401, 400, 404, 500, network)
 * ✅ Production-ready with timeout config
 *
 * Usage:
 * import api, { getJobs, login } from './services/api'
 */

import axios from "axios";
import { readStoredAuth, clearStoredAuth } from "../utils/authStorage";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// AXIOS INSTANCE - Core API Configuration
// ============================================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Automatic JWT Token Attachment
// ============================================================================

api.interceptors.request.use(
  (config) => {
    /**
     * Retrieve JWT token from localStorage and attach it to Authorization header
     * This runs automatically before every request
     */
    const { token } = readStoredAuth();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR - Global Error Handling
// ============================================================================

api.interceptors.response.use(
  (response) => {
    /**
     * Success: return response as-is
     */
    return response;
  },
  (error) => {
    /**
     * Handle various error scenarios globally
     */
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // ====================================================================
    // 401 UNAUTHORIZED - Token expired or invalid
    // ====================================================================
    if (status === 401) {
      console.warn("[API 401 ERROR] Unauthorized - Clearing token");
      clearStoredAuth();

      // Dispatch custom event for components to listen to
      window.dispatchEvent(new Event("authExpired"));

      return Promise.reject({
        status: 401,
        message: "Unauthorized. Please log in again.",
        originalError: error,
      });
    }

    // ====================================================================
    // 400 BAD REQUEST - Validation or client error
    // ====================================================================
    if (status === 400) {
      console.error("[API 400 ERROR] Bad Request:", message);
      return Promise.reject({
        status: 400,
        message: message || "Invalid request. Please check your input.",
        errors: error.response?.data?.errors,
        originalError: error,
      });
    }

    // ====================================================================
    // 403 FORBIDDEN - Permission denied
    // ====================================================================
    if (status === 403) {
      console.error("[API 403 ERROR] Forbidden:", message);
      return Promise.reject({
        status: 403,
        message:
          message || "You do not have permission to access this resource.",
        errors: error.response?.data?.errors,
        originalError: error,
      });
    }

    // ====================================================================
    // 404 NOT FOUND - Resource does not exist
    // ====================================================================
    if (status === 404) {
      console.error("[API 404 ERROR] Not Found:", message);
      return Promise.reject({
        status: 404,
        message: message || "The requested resource was not found.",
        errors: error.response?.data?.errors,
        originalError: error,
      });
    }

    // ====================================================================
    // 500+ SERVER ERRORS - Backend or server issue
    // ====================================================================
    if (status >= 500) {
      console.error("[API SERVER ERROR]", `Status ${status}:`, message);
      return Promise.reject({
        status: status || 500,
        message: message || "Server error. Please try again later.",
        errors: error.response?.data?.errors,
        originalError: error,
      });
    }

    // ====================================================================
    // NETWORK ERRORS - No response from server
    // ====================================================================
    if (!error.response) {
      console.error("[API NETWORK ERROR]", error);
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
        errors: error.response?.data?.errors,
        originalError: error,
      });
    }

    // ====================================================================
    // OTHER ERRORS
    // ====================================================================
    console.error("[API ERROR]", error);
    return Promise.reject({
      status: status || 500,
      message: message || "An unexpected error occurred.",
      errors: error.response?.data?.errors,
      originalError: error,
    });
  },
);

// ============================================================================
// JOB ENDPOINTS
// ============================================================================

export const getJobs = async (params = {}) => {
  const { data } = await api.get("/api/jobs", { params });
  return data;
};

export const getJobById = async (jobId) => {
  const { data } = await api.get(`/api/jobs/${jobId}`);
  return data.job;
};

export const createJob = async (payload) => {
  const { data } = await api.post("/api/jobs", payload);
  return data;
};

export const updateJob = async (jobId, payload) => {
  const { data } = await api.put(`/api/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await api.delete(`/api/jobs/${jobId}`);
  return data;
};

// ============================================================================
// APPLICATION ENDPOINTS
// ============================================================================

export const applyToJob = async (jobId, payload) => {
  const { data } = await api.post(`/api/applications/${jobId}`, payload);
  return data;
};

export const getApplicantsForJob = async (jobId, params = {}) => {
  const { data } = await api.get(`/api/applications/job/${jobId}`, { params });
  return data;
};

export const getMyApplications = async (params = {}) => {
  const { data } = await api.get("/api/applications/me", { params });
  return data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.put(`/api/applications/${applicationId}/status`, {
    status,
  });
  return data;
};

export const updateApplicationStatusByJobId = async (jobId, status) => {
  const { data } = await api.put(`/api/applications/job/${jobId}/status`, {
    status,
  });
  return data;
};

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const signup = async (payload) => {
  const { data } = await api.post("/api/auth/signup", payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/api/auth/me");
  return data;
};

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Extract error message from API response
 * @param {Error} error - Error object from API call
 * @param {string} defaultMessage - Fallback message if no error message found
 * @returns {string} Error message for user display
 */
export const getErrorMessage = (
  error,
  defaultMessage = "An error occurred",
) => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return defaultMessage;
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default export: The configured Axios instance
 * Use this directly for custom API calls not covered by the endpoint wrappers
 *
 * Examples:
 * api.get('/api/custom-endpoint')
 * api.post('/api/custom-endpoint', { data })
 */
export default api;

/**
 * Export configuration constants for use in other parts of the app
 */
export { API_BASE_URL, API_TIMEOUT };
