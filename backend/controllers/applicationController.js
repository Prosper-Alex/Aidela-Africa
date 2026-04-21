import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

/* ================= APPLY ================= */
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resume, coverLetter } = req.body;

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
      resume,
      coverLetter,
      status: "pending",
    });

    job.applicationsCount = (job.applicationsCount || 0) + 1;
    await job.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET APPLICATIONS ================= */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
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
