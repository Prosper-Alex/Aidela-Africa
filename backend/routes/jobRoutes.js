import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isRecruiter } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/").get(getJobs).post(protect, isRecruiter, createJob);
router.route("/:id").get(getJobById).put(protect, updateJob).delete(protect, deleteJob);

export default router;
