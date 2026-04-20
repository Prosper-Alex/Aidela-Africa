import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const VALID_APPLICATION_STATUSES = new Set(["pending", "accepted", "rejected"]);
const VALID_STATUS_UPDATES = new Set(["accepted", "rejected"]);

const parsePositiveInt = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const normalizeStatus = (status) => {
  if (status === undefined) {
    return undefined;
  }

  if (typeof status !== "string") {
    throw new AppError("Status must be a string", 400);
  }

  return status.trim().toLowerCase();
};

const validateObjectId = (value, message) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(message, 400);
  }
};

const findJobByIdOrThrow = async (jobId) => {
  validateObjectId(jobId, "Invalid job ID");

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

const assertJobOwner = (job, userId) => {
  const ownerId = job.createdBy?._id ? job.createdBy._id.toString() : job.createdBy.toString();

  if (ownerId !== userId.toString()) {
    throw new AppError("Forbidden: you can only access applications for your own jobs", 403);
  }
};

const buildPagination = (total, page, limit) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const applyToJob = asyncHandler(async (req, res) => {
  const { job: jobId, resume } = req.body;

  if (!jobId) {
    throw new AppError("Job ID is required", 400);
  }

  const job = await findJobByIdOrThrow(jobId);

  const existingApplication = await Application.findOne({
    user: req.user._id,
    job: job._id,
  });

  if (existingApplication) {
    throw new AppError("You have already applied to this job", 400);
  }

  const application = await Application.create({
    user: req.user._id,
    job: job._id,
    resume,
  });

  const populatedApplication = await Application.findById(application._id)
    .populate("user", "name email role")
    .populate("job", "title company location jobType createdBy");

  res.status(201).json({
    message: "Application submitted successfully",
    application: populatedApplication,
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  const status = normalizeStatus(req.query.status);
  const filters = { user: req.user._id };

  if (status) {
    if (!VALID_APPLICATION_STATUSES.has(status)) {
      throw new AppError("Invalid application status filter", 400);
    }

    filters.status = status;
  }

  const [applications, total] = await Promise.all([
    Application.find(filters)
      .populate("job", "title company location jobType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filters),
  ]);

  res.status(200).json({
    applications,
    pagination: buildPagination(total, page, limit),
    filters: {
      status: status || null,
    },
  });
});

const getApplicantsForJob = asyncHandler(async (req, res) => {
  const job = await findJobByIdOrThrow(req.params.jobId);

  assertJobOwner(job, req.user._id);

  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  const status = normalizeStatus(req.query.status);
  const filters = { job: job._id };

  if (status) {
    if (!VALID_APPLICATION_STATUSES.has(status)) {
      throw new AppError("Invalid application status filter", 400);
    }

    filters.status = status;
  }

  const [applications, total] = await Promise.all([
    Application.find(filters)
      .populate("user", "name email role")
      .populate("job", "title company location jobType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filters),
  ]);

  res.status(200).json({
    job: {
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
    },
    applications,
    pagination: buildPagination(total, page, limit),
    filters: {
      status: status || null,
    },
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "Invalid application ID");

  const status = normalizeStatus(req.body.status);

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  if (!VALID_STATUS_UPDATES.has(status)) {
    throw new AppError("Status must be accepted or rejected", 400);
  }

  const application = await Application.findById(req.params.id)
    .populate("job", "title company location jobType createdBy")
    .populate("user", "name email role");

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (!application.job) {
    throw new AppError("Associated job not found", 404);
  }

  assertJobOwner(application.job, req.user._id);

  application.status = status;
  await application.save();

  res.status(200).json({
    message: "Application status updated successfully",
    application,
  });
});

export {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
};
