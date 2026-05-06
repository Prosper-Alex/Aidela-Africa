// Key feature: Maps authentication, profile, and password reset endpoints to handlers.
import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  completeOnboarding,
  uploadProfileImage,
  requestResetOtp,
  verifyResetOtp,
  resetPasswordWithOtpSession,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }

    callback(null, true);
  },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/request-reset-otp", passwordResetLimiter, requestResetOtp);
router.post("/verify-reset-otp", passwordResetLimiter, verifyResetOtp);
router.post("/reset-password", passwordResetLimiter, resetPasswordWithOtpSession);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);
router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateCurrentUser);
router.patch("/onboarding", protect, completeOnboarding);
router.post("/upload-image", protect, upload.single("image"), uploadProfileImage);

export default router;
