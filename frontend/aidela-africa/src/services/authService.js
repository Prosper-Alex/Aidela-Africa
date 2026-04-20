import API from "../pages/utils/axiosinstance";

export const loginUser = async (payload) => {
  const { data } = await API.post("/api/auth/login", payload);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await API.post("/api/auth/register", payload);
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await API.get("/api/auth/me");
  return data.user;
};
