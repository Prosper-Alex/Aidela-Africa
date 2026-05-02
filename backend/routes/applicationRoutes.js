// Key feature: Maps application-related API endpoints to their controller handlers.
import express from "express";
import {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
  updateApplicationStatusByJobId,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isRecruiter, isJobSeeker } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply to a job (job seekers only)
router.post("/:jobId", protect, isJobSeeker, applyToJob);

// Get current user's applications (job seekers only)
router.get("/me", protect, isJobSeeker, getMyApplications);

// Recruiters: view applicants for a job (recruiter middleware + controller ownership check)
router.get("/job/:jobId", protect, isRecruiter, getApplicationsForJob);

router.put("/:id/status", protect, updateApplicationStatus);

// Update application status by job ID
router.put("/job/:jobId/status", protect, updateApplicationStatusByJobId);

export default router;
