import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

/* ================= APPLY ================= */
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      resume,
      coverLetter,
      portfolioUrl,
      linkedinUrl,
      availability,
      expectedSalary,
      skillsMatch,
      standoutAnswer,
    } = req.body;

    // only job seekers may apply (defensive check - route middleware should already enforce this)
    if (req.user?.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only job seekers can apply to jobs" });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "You already applied" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      user: req.user._id,
      resume: resume || "",
      coverLetter: coverLetter || "",
      portfolioUrl: portfolioUrl || "",
      linkedinUrl: linkedinUrl || "",
      availability: availability || "",
      expectedSalary: expectedSalary || "",
      skillsMatch: skillsMatch || "",
      standoutAnswer: standoutAnswer || "",
      status: "pending",
    });

    job.applicationsCount = (job.applicationsCount || 0) + 1;
    await job.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already applied to this job.",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

/* ================= GET APPLICATIONS ================= */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Ensure the requesting recruiter owns the job
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: not the job owner" });
    }

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email candidateProfile verification")
      .populate("user", "name email candidateProfile verification")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET MY APPLICATIONS ================= */
export const getMyApplications = async (req, res) => {
  try {
    // support simple pagination params: page, limit
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
    const skip = (page - 1) * limit;

    const query = { applicant: req.user._id };

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({ path: "job", select: "title company location" })
        .populate("applicant", "name email candidateProfile verification")
        .populate("user", "name email candidateProfile verification")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(query),
    ]);

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE BY ID ================= */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "reviewed", "accepted", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 🔐 Ensure owner
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    application.status = status;
    await application.save();

    res.json({
      message: "Status updated",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE BY JOB ID (SAFE) ================= */
export const updateApplicationStatusByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "reviewed", "accepted", "rejected"];

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 🔥 IMPORTANT: match BOTH job + applicant
    const application = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
