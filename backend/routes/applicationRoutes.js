import express from "express";
import {
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
  updateApplicationStatusByJobId,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply to a job
router.post("/:jobId", protect, applyToJob);

router.get("/job/:jobId", protect, getApplicationsForJob);

router.put("/:id/status", protect, updateApplicationStatus);

// Update application status by job ID
router.put("/job/:jobId/status", protect, updateApplicationStatusByJobId);

export default router;
