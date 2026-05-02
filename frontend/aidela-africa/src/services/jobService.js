// Key feature: Wraps frontend calls for job listing API operations.
import API from "../pages/utils/axiosinstance";

export const getJobs = async (params = {}) => {
  try {
    const { data } = await API.get("/api/jobs", { params });

    // Ensure consistent response structure with defensive fallbacks
    console.log("[Jobs API] Response received:", {
      jobs: data?.jobs?.length,
      pagination: data?.pagination,
    });

    return {
      jobs: Array.isArray(data?.jobs) ? data.jobs : [],
      pagination: data?.pagination || {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      filters: data?.filters || { location: null, jobType: null, search: null },
    };
  } catch (error) {
    console.error("[Jobs API] Error:", error);
    throw error;
  }
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
    jobs: Array.isArray(data?.jobs)
      ? data.jobs.filter((job) => job?.createdBy?._id === userId)
      : [],
  };
};
