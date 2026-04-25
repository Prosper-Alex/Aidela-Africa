import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeRole } from "../utils/normalizeRole.js";

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

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const getVerification = (user) => {
  const normalizedRole = normalizeRole(user.role);

  if (normalizedRole === "recruiter") {
    const profile = user.companyProfile || {};
    const requirements = [
      ["Company name", hasText(profile.companyName)],
      ["Company logo", hasText(profile.companyLogo)],
      ["Company bio", hasText(profile.bio)],
      ["Employee count", Number(profile.employeeCount) > 0],
      ["Founded year", Number(profile.foundedYear) > 0],
      ["Founded by", hasText(profile.foundedBy)],
    ];
    const completed = requirements.filter(([, isComplete]) => isComplete).length;

    return {
      isVerified: completed === requirements.length,
      completed,
      total: requirements.length,
      missing: requirements
        .filter(([, isComplete]) => !isComplete)
        .map(([label]) => label),
    };
  }

  const profile = user.candidateProfile || {};
  const requirements = [
    ["Headline", hasText(profile.headline)],
    ["Bio", hasText(profile.bio)],
    ["Tech stack", Array.isArray(profile.techStack) && profile.techStack.length > 0],
    [
      "Years of experience",
      profile.yearsOfExperience !== null &&
        profile.yearsOfExperience !== undefined &&
        Number(profile.yearsOfExperience) >= 0,
    ],
    ["Portfolio URL", hasText(profile.portfolioUrl)],
    ["Location", hasText(profile.location)],
  ];
  const completed = requirements.filter(([, isComplete]) => isComplete).length;

  return {
    isVerified: completed === requirements.length,
    completed,
    total: requirements.length,
    missing: requirements
      .filter(([, isComplete]) => !isComplete)
      .map(([label]) => label),
  };
};

const serializeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;

  return {
    ...userObject,
    role: normalizeRole(userObject.role),
    verification: getVerification(userObject),
  };
};

const buildProfileUpdates = (body, role) => {
  const updates = {};

  if (body.name !== undefined) {
    updates.name = body.name;
  }

  if (role === "recruiter") {
    const profile = body.companyProfile || {};
    updates.companyProfile = {
      companyName: profile.companyName || "",
      companyLogo: profile.companyLogo || "",
      bio: profile.bio || "",
      employeeCount:
        profile.employeeCount === "" || profile.employeeCount === undefined
          ? null
          : Number(profile.employeeCount),
      foundedYear:
        profile.foundedYear === "" || profile.foundedYear === undefined
          ? null
          : Number(profile.foundedYear),
      foundedBy: profile.foundedBy || "",
      websiteUrl: profile.websiteUrl || "",
      headquarters: profile.headquarters || "",
    };

    return updates;
  }

  const profile = body.candidateProfile || {};
  updates.candidateProfile = {
    headline: profile.headline || "",
    bio: profile.bio || "",
    techStack: compactStringArray(profile.techStack),
    yearsOfExperience:
      profile.yearsOfExperience === "" || profile.yearsOfExperience === undefined
        ? null
        : Number(profile.yearsOfExperience),
    portfolioUrl: profile.portfolioUrl || "",
    linkedinUrl: profile.linkedinUrl || "",
    location: profile.location || "",
    availability: profile.availability || "",
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

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: serializeUser(req.user),
  });
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.user.role);
  const updates = buildProfileUpdates(req.body, role);

  Object.assign(req.user, updates);
  await req.user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: serializeUser(req.user),
  });
});

export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
};
