import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Legacy field kept for backward compatibility with older Mongo indexes.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resume: {
      type: String,
      default: "",
      trim: true,
    },
    coverLetter: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    portfolioUrl: {
      type: String,
      default: "",
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
    availability: {
      type: String,
      default: "",
      trim: true,
    },
    expectedSalary: {
      type: String,
      default: "",
      trim: true,
    },
    skillsMatch: {
      type: String,
      default: "",
      trim: true,
    },
    standoutAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

// Keeps older records using `user` compatible with newer code using `applicant`.
applicationSchema.pre("validate", function syncLegacyUserField(next) {
  if (!this.applicant && this.user) {
    this.applicant = this.user;
  }

  if (!this.user && this.applicant) {
    this.user = this.applicant;
  }

  next();
});

// A user can apply to the same job only once.
applicationSchema.index(
  { applicant: 1, job: 1 },
  {
    unique: true,
    partialFilterExpression: {
      applicant: { $exists: true },
      job: { $exists: true },
    },
  },
);

export default mongoose.model("Application", applicationSchema);
