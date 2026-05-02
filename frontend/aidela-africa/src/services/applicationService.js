// Key feature: Wraps frontend calls for job application API operations.
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

  if (Array.isArray(data)) {
    return {
      applications: data,
      job: null,
    };
  }

  return {
    applications: Array.isArray(data?.applications) ? data.applications : [],
    job: data?.job || null,
  };
};

export const updateApplicationStatus = async (applicationId, status) => {
  const nextStatus =
    typeof status === "string" ? status : status?.status || "";
  const { data } = await API.put(
    `/api/applications/${applicationId}/status`,
    {
      status: nextStatus,
    },
  );
  return data;
};
