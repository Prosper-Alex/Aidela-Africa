import express from "express";
import {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isJobSeeker, isRecruiter } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, isJobSeeker, applyToJob);
router.get("/me", protect, isJobSeeker, getMyApplications);
router.get("/job/:jobId", protect, isRecruiter, getApplicantsForJob);
router.put("/:id", protect, isRecruiter, updateApplicationStatus);

export default router;
