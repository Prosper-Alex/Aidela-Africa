// Key feature: Handles registration, login, profile updates, and secure password reset flows.
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeRole } from "../utils/normalizeRole.js";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSecurityAlert,
} from "../utils/emailService.js";
import { computeVerification } from "../utils/verification.js";

const RESET_TOKEN_EXPIRES_MINUTES = 15;
const PASSWORD_RESET_SUCCESS_MESSAGE = "If this email exists, a reset link has been sent";
const RESET_OTP_SUCCESS_MESSAGE = "If this email exists, a verification code has been sent";
const RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const RESET_OTP_EXPIRES_MINUTES = 10;
const RESET_OTP_MAX_ATTEMPTS = 5;

const compactStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getVerification = (user) => {
  return computeVerification({
    ...user,
    role: normalizeRole(user.role),
  });
};

const serializeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  const verification = getVerification(userObject);

  return {
    ...userObject,
    role: normalizeRole(userObject.role),
    isVerified: verification.isVerified,
    verification,
  };
};

const buildProfileUpdates = (body, role, user = {}) => {
  const updates = {};

  if (body.name !== undefined) {
    updates.name = body.name;
  }

  if (body.avatar !== undefined) {
    updates.avatar = body.avatar;
  }

  if (role === "recruiter") {
    const currentProfile = user.companyProfile?.toObject?.() || user.companyProfile || {};
    const profile = body.companyProfile || {};
    updates.companyProfile = {
      companyName: profile.companyName ?? currentProfile.companyName ?? "",
      companyLogo: profile.companyLogo ?? currentProfile.companyLogo ?? "",
      bio: profile.bio ?? currentProfile.bio ?? "",
      employeeCount:
        profile.employeeCount === "" || profile.employeeCount === undefined
          ? currentProfile.employeeCount ?? null
          : Number(profile.employeeCount),
      foundedYear:
        profile.foundedYear === "" || profile.foundedYear === undefined
          ? currentProfile.foundedYear ?? null
          : Number(profile.foundedYear),
      foundedBy: profile.foundedBy ?? currentProfile.foundedBy ?? "",
      websiteUrl: profile.websiteUrl ?? currentProfile.websiteUrl ?? "",
      headquarters: profile.headquarters ?? currentProfile.headquarters ?? "",
    };

    return updates;
  }

  const currentProfile = user.candidateProfile?.toObject?.() || user.candidateProfile || {};
  const profile = body.candidateProfile || {};
  updates.candidateProfile = {
    headline: profile.headline ?? currentProfile.headline ?? "",
    bio: profile.bio ?? currentProfile.bio ?? "",
    techStack:
      profile.techStack === undefined
        ? currentProfile.techStack || []
        : compactStringArray(profile.techStack),
    yearsOfExperience:
      profile.yearsOfExperience === "" || profile.yearsOfExperience === undefined
        ? currentProfile.yearsOfExperience ?? null
        : Number(profile.yearsOfExperience),
    portfolioUrl: profile.portfolioUrl ?? currentProfile.portfolioUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? currentProfile.linkedinUrl ?? "",
    location: profile.location ?? currentProfile.location ?? "",
    availability: profile.availability ?? currentProfile.availability ?? "",
  };

  return updates;
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: normalizeRole(role || "jobseeker"),
  });

  res.status(201).json({
    message: "User registered successfully",
    user: serializeUser(user),
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({
    message: "Login successful",
    user: serializeUser(user),
    token: generateToken(user._id),
  });
});

const createPasswordResetToken = () => {
  // Generate a one-time raw token for email and store only its hash in MongoDB.
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hashedToken };
};

const createResetOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashResetOtp = (otp) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(`${otp}`)
    .digest("hex");

const isMatchingOtpHash = (otp, hashedOtp) => {
  if (!otp || !hashedOtp) {
    return false;
  }

  const submittedHash = hashResetOtp(otp);
  const submittedBuffer = Buffer.from(submittedHash, "hex");
  const storedBuffer = Buffer.from(hashedOtp, "hex");

  if (submittedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(submittedBuffer, storedBuffer);
};

const createResetAccessToken = (userId) =>
  jwt.sign(
    {
      id: userId,
      resetAccess: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

const getResetTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.body.resetToken || req.body.token || "";
};

const getPasswordResetUrl = (token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${clientUrl.replace(/\/$/, "")}/reset-password/${token}`;
};

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const response = {
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
  };

  // Keep the same public response for existing and missing users to prevent email enumeration.
  let user;

  try {
    user = await User.findOne({ email: normalizedEmail });
  } catch (error) {
    console.error(`Password reset lookup failed for ${normalizedEmail}: ${error.message}`);
    throw error;
  }

  // Always return the same response so attackers cannot check which emails exist.
  if (!user) {
    res.status(200).json(response);
    return;
  }

  const { token, hashedToken } = createPasswordResetToken();
  const resetUrl = getPasswordResetUrl(token);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(
    Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000,
  );
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    // Clear reset state if email delivery fails so users cannot be stuck with a hidden active token.
    console.error(`Password reset email failed for ${user.email}: ${error.message}`);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }

  res.status(200).json(response);
});

const requestResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const response = {
    message: RESET_OTP_SUCCESS_MESSAGE,
  };

  if (!email) {
    res.status(200).json(response);
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+resetOtp +resetOtpExpire +resetOtpAttempts",
  );

  if (!user) {
    res.status(200).json(response);
    return;
  }

  const otp = createResetOtp();
  user.resetOtp = hashResetOtp(otp);
  user.resetOtpExpire = new Date(
    Date.now() + RESET_OTP_EXPIRES_MINUTES * 60 * 1000,
  );
  user.resetOtpAttempts = 0;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  try {
    await sendOtpEmail(user.email, otp);
    console.info(`Reset OTP email sent to ${user.email}`);
  } catch (error) {
    console.error(`Reset OTP email failed for ${user.email}: ${error.message}`);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
  }

  res.status(200).json(response);
});

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and verification code are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+resetOtp +resetOtpExpire +resetOtpAttempts",
  );

  if (!user || !user.resetOtp || !user.resetOtpExpire) {
    throw new AppError("Verification code is invalid or expired", 400);
  }

  if (user.resetOtpExpire < new Date()) {
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
    throw new AppError("Verification code has expired", 400);
  }

  if ((user.resetOtpAttempts || 0) >= RESET_OTP_MAX_ATTEMPTS) {
    throw new AppError("Too many invalid attempts. Request a new code.", 429);
  }

  const isOtpValid = isMatchingOtpHash(otp, user.resetOtp);

  if (!isOtpValid) {
    user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
    await user.save();
    throw new AppError("Verification code is invalid or expired", 400);
  }

  const resetToken = createResetAccessToken(user._id);

  res.status(200).json({
    message: "Verification successful",
    resetToken,
    expiresInMinutes: 10,
  });
});

const resetPasswordWithOtpSession = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const resetToken = getResetTokenFromRequest(req);

  if (!resetToken) {
    throw new AppError("Password reset session is required", 401);
  }

  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Password reset session has expired", 401);
    }

    throw new AppError("Password reset session is invalid", 401);
  }

  if (!decodedToken.resetAccess || !decodedToken.id) {
    throw new AppError("Password reset session is invalid", 401);
  }

  const user = await User.findById(decodedToken.id).select(
    "+password +resetOtp +resetOtpExpire +resetOtpAttempts",
  );

  if (!user) {
    throw new AppError("Password reset session is invalid", 401);
  }

  user.password = password;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  user.resetOtpAttempts = 0;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  try {
    await sendSecurityAlert(user.email, {
      action: "Your Aidela Africa password was changed using password recovery.",
    });
  } catch (error) {
    console.error(`Password reset security alert failed for ${user.email}: ${error.message}`);
  }

  res.status(200).json({
    message: "Password reset successful",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token || !RESET_TOKEN_PATTERN.test(token)) {
    throw new AppError("Password reset token is required", 400);
  }

  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // Match against the hashed token and expiry so raw reset tokens are never stored or queried directly.
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    throw new AppError("Password reset link is invalid or expired", 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  res.status(200).json({
    message: "Password reset successful",
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: serializeUser(req.user),
  });
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.user.role);
  const updates = buildProfileUpdates(req.body, role, req.user);

  Object.assign(req.user, updates);
  await req.user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: serializeUser(req.user),
  });
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.user.role);
  const updates = buildProfileUpdates(req.body, role, req.user);

  Object.assign(req.user, updates);
  req.user.isOnboarded = true;
  await req.user.save();

  res.status(200).json({
    message: "Onboarding completed successfully",
    user: serializeUser(req.user),
  });
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  const { target = "avatar" } = req.body;

  if (!req.file) {
    throw new AppError("Image file is required", 400);
  }

  const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  if (target === "companyLogo") {
    req.user.companyProfile = {
      ...(req.user.companyProfile?.toObject?.() || req.user.companyProfile || {}),
      companyLogo: imageUrl,
    };
  } else {
    req.user.avatar = imageUrl;
  }

  await req.user.save();

  res.status(200).json({
    message: "Image uploaded successfully",
    imageUrl,
    user: serializeUser(req.user),
  });
});

export {
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
};
