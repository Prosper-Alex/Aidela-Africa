import API from "../pages/utils/axiosinstance";

export const applyToJob = async (payload) => {
  const { data } = await API.post("/api/applications", payload);
  return data;
};

export const getMyApplications = async (params = {}) => {
  const { data } = await API.get("/api/applications/me", { params });
  return data;
};

export const getApplicantsForJob = async (jobId, params = {}) => {
  const { data } = await API.get(`/api/applications/job/${jobId}`, { params });
  return data;
};

export const updateApplicationStatus = async (applicationId, payload) => {
  const { data } = await API.put(`/api/applications/${applicationId}`, payload);
  return data;
};
