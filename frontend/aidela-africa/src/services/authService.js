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

export const resetPassword = async (token, payload) => {
  const { data } = await API.post(`/api/auth/reset-password/${token}`, payload);
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
