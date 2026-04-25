import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    },
  },
  { timestamps: true },
);

applicationSchema.pre("validate", function syncLegacyUserField(next) {
  if (!this.applicant && this.user) {
    this.applicant = this.user;
  }

  if (!this.user && this.applicant) {
    this.user = this.applicant;
  }

  next();
});

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
