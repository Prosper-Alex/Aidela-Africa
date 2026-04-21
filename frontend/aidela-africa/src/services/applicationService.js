import API from "../pages/utils/axiosinstance";

export const applyToJob = async (jobId, payload) => {
  const { data } = await API.post(`/api/applications/${jobId}`, payload);
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

export const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await API.put(`/api/applications/${applicationId}/status`, {
    status,
  });
  return data;
};
