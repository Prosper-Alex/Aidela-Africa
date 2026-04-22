import mongoose from "mongoose";
import Job from "../models/Job.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const VALID_JOB_TYPES = new Set(["full-time", "part-time", "contract", "remote"]);
const JOB_TYPE_MAP = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const normalizeRequirements = (requirements) => {
  if (requirements === undefined) {
    return undefined;
  }

  if (Array.isArray(requirements)) {
    return requirements;
  }

  if (typeof requirements === "string") {
    return requirements
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new AppError("Requirements must be an array of strings", 400);
};

const normalizeJobType = (jobType) => {
  if (jobType === undefined) {
    return undefined;
  }

  const normalizedJobType = `${jobType}`.trim().toLowerCase();
  const mappedJobType = JOB_TYPE_MAP[normalizedJobType];

  if (!mappedJobType) {
    throw new AppError("Invalid job type", 400);
  }

  return mappedJobType;
};

const parseSalaryNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number.parseFloat(`${value}`.replace(/,/g, "").trim());

  if (Number.isNaN(parsedValue)) {
    throw new AppError("Salary values must be valid numbers", 400);
  }

  return parsedValue;
};

const normalizeSalary = (salary) => {
  if (salary === undefined) {
    return undefined;
  }

  if (salary === null || salary === "") {
    return {};
  }

  if (typeof salary !== "object" || Array.isArray(salary)) {
    throw new AppError(
      "Salary must be submitted as min, max, and currency fields",
      400,
    );
  }

  const min = parseSalaryNumber(salary.min);
  const max = parseSalaryNumber(salary.max);
  const currency = `${salary.currency || "USD"}`.trim().toUpperCase();

  return {
    min,
    max,
    currency: currency || "USD",
  };
};

const buildJobPayload = (body) => {
  const payload = {};
  const fields = ["title", "company", "location", "description"];

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  const normalizedJobType = normalizeJobType(body.jobType);
  if (normalizedJobType !== undefined) {
    payload.jobType = normalizedJobType;
  }

  const normalizedSalary = normalizeSalary(body.salary);
  if (normalizedSalary !== undefined) {
    payload.salary = normalizedSalary;
  }

  const normalizedRequirements = normalizeRequirements(body.requirements);

  if (normalizedRequirements !== undefined) {
    payload.requirements = normalizedRequirements;
  }

  return payload;
};

const getJobOwnerId = (job) =>
  job.createdBy?._id ? job.createdBy._id.toString() : job.createdBy.toString();

const assertJobOwner = (job, userId) => {
  if (getJobOwnerId(job) !== userId.toString()) {
    throw new AppError("Forbidden: you can only manage your own jobs", 403);
  }
};

const findJobByIdOrThrow = async (jobId) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw new AppError("Invalid job ID", 400);
  }

  const job = await Job.findById(jobId).populate("createdBy", "name email role");

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

const createJob = asyncHandler(async (req, res) => {
  const payload = buildJobPayload(req.body);

  const job = await Job.create({
    ...payload,
    createdBy: req.user._id,
  });

  const populatedJob = await Job.findById(job._id).populate("createdBy", "name email role");

  res.status(201).json({
    message: "Job created successfully",
    job: populatedJob,
  });
});

const getJobs = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  const filters = {};

  if (req.query.location?.trim()) {
    filters.location = {
      $regex: escapeRegex(req.query.location.trim()),
      $options: "i",
    };
  }

  if (req.query.jobType?.trim()) {
    const normalizedJobType = req.query.jobType.trim().toLowerCase();

    if (!VALID_JOB_TYPES.has(normalizedJobType)) {
      throw new AppError("Invalid jobType filter", 400);
    }

    filters.jobType = JOB_TYPE_MAP[normalizedJobType];
  }

  if (req.query.search?.trim()) {
    const searchPattern = new RegExp(escapeRegex(req.query.search.trim()), "i");

    filters.title = searchPattern;
  }

  const [jobs, total] = await Promise.all([
    Job.find(filters)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filters),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  res.status(200).json({
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      location: req.query.location?.trim() || null,
      jobType: req.query.jobType?.trim() || null,
      search: req.query.search?.trim() || null,
    },
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await findJobByIdOrThrow(req.params.id);

  res.status(200).json({ job });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await findJobByIdOrThrow(req.params.id);

  assertJobOwner(job, req.user._id);

  const updates = buildJobPayload(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid job fields provided for update", 400);
  }

  Object.assign(job, updates);
  await job.save();
  await job.populate("createdBy", "name email role");

  res.status(200).json({
    message: "Job updated successfully",
    job,
  });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await findJobByIdOrThrow(req.params.id);

  assertJobOwner(job, req.user._id);
  await job.deleteOne();

  res.status(200).json({
    message: "Job deleted successfully",
  });
});

export {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
