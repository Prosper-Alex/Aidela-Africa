import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const candidateProfileSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    techStack: { type: [String], default: [] },
    yearsOfExperience: { type: Number, min: 0, default: null },
    portfolioUrl: { type: String, trim: true, default: "" },
    linkedinUrl: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    availability: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true, default: "" },
    companyLogo: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    employeeCount: { type: Number, min: 0, default: null },
    foundedYear: { type: Number, min: 1800, default: null },
    foundedBy: { type: String, trim: true, default: "" },
    websiteUrl: { type: String, trim: true, default: "" },
    headquarters: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const getVerificationForUser = (user) => {
  if (user.role === "recruiter") {
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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["jobseeker", "recruiter"],
      default: "jobseeker",
    },
    candidateProfile: {
      type: candidateProfileSchema,
      default: () => ({}),
    },
    companyProfile: {
      type: companyProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.virtual("verification").get(function verificationVirtual() {
  return getVerificationForUser(this);
});

userSchema.pre("save", async function saveHook(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
