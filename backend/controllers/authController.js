import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeRole } from "../utils/normalizeRole.js";

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
    user,
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
    user: {
      ...user.toObject(),
      role: normalizeRole(user.role),
    },
    token: generateToken(user._id),
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: {
      ...req.user.toObject(),
      role: normalizeRole(req.user.role),
    },
  });
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
};
