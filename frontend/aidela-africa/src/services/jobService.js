import API from "../pages/utils/axiosinstance";

export const getJobs = async (params = {}) => {
  const { data } = await API.get("/api/jobs", { params });
  return data;
};

export const getJobById = async (jobId) => {
  const { data } = await API.get(`/api/jobs/${jobId}`);
  return data.job;
};

export const createJob = async (payload) => {
  const { data } = await API.post("/api/jobs", payload);
  return data;
};

export const updateJob = async (jobId, payload) => {
  const { data } = await API.put(`/api/jobs/${jobId}`, payload);
  return data;
};

export const deleteJob = async (jobId) => {
  const { data } = await API.delete(`/api/jobs/${jobId}`);
  return data;
};

export const getRecruiterJobs = async (userId, params = {}) => {
  const data = await getJobs({ limit: 100, ...params });

  return {
    ...data,
    jobs: data.jobs.filter((job) => job.createdBy?._id === userId),
  };
};
