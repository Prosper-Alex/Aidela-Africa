// Key feature: Wraps frontend calls to authentication and profile API endpoints.
import API from "../pages/utils/axiosinstance";

export const loginUser = async (payload) => {
  const { data } = await API.post("/api/auth/login", payload);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await API.post("/api/auth/register", payload);
  return data;
};

export const forgotPassword = async (payload) => {
  const { data } = await API.post("/api/auth/forgot-password", payload);
  return data;
};

export const requestResetOtp = async (payload) => {
  const { data } = await API.post("/api/auth/request-reset-otp", payload);
  return data;
};

export const verifyResetOtp = async (payload) => {
  const { data } = await API.post("/api/auth/verify-reset-otp", payload);
  return data;
};

export const resetPassword = async (token, payload) => {
  const { data } = await API.post(`/api/auth/reset-password/${token}`, payload);
  return data;
};

export const resetPasswordWithToken = async (payload) => {
  const { data } = await API.post("/api/auth/reset-password", payload);
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await API.get("/api/auth/me");
  return data.user;
};

export const updateCurrentUser = async (payload) => {
  const { data } = await API.patch("/api/auth/me", payload);
  return data;
};

export const completeOnboarding = async (payload) => {
  const { data } = await API.patch("/api/auth/onboarding", payload);
  return data;
};

export const uploadProfileImage = async ({ file, target }) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("target", target);

  const { data } = await API.post("/api/auth/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
