import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { sanitizeArray, sanitizeString } from "../utils/sanitize.js";
import {
  isValidCompanyName,
  isValidEmail,
  isValidURL,
} from "../utils/validators.js";
import { computeVerification } from "../utils/verification.js";

// ✅ Candidate profile
const candidateProfileSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    techStack: { type: [String], default: [], set: sanitizeArray },
    yearsOfExperience: { type: Number, min: 0, default: null },
    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
      validate: [isValidURL, "Invalid URL"],
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
      validate: [isValidURL, "Invalid URL"],
    },
    location: { type: String, trim: true, default: "" },
    availability: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

// ✅ Company profile
const companyProfileSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
      default: "",
      validate: [isValidCompanyName, "Invalid company name"],
    },
    companyLogo: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    employeeCount: { type: Number, min: 0, default: null },
    foundedYear: { type: Number, min: 1800, default: null },
    foundedBy: { type: String, trim: true, default: "" },
    websiteUrl: {
      type: String,
      trim: true,
      default: "",
      validate: [isValidURL, "Invalid URL"],
    },
    headquarters: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      set: sanitizeString,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [isValidEmail, "Invalid email"],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["jobseeker", "recruiter"],
      default: "jobseeker",
    },

    // Cached verification avoids recalculating profile completeness on every request.
    verificationStatus: {
      isVerified: { type: Boolean, default: false },
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    candidateProfile: { type: candidateProfileSchema, default: () => ({}) },
    companyProfile: { type: companyProfileSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// Compute verification only when the user is saved.
userSchema.pre("save", function (next) {
  this.verificationStatus = computeVerification(this);
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Used during login to compare the submitted password with the hashed password.
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
