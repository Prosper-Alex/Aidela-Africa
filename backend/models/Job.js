import mongoose from "mongoose";

const { Schema } = mongoose;

const salaryValidator = (value) =>
  value === null ||
  value === undefined ||
  typeof value === "string" ||
  (typeof value === "number" && Number.isFinite(value));

const cleanRequirements = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }

  return values
    .map((value) => (typeof value === "string" ? value.trim() : value))
    .filter(Boolean);
};

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [2, "Job title must be at least 2 characters long"],
      maxlength: [120, "Job title cannot exceed 120 characters"],
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [120, "Company name cannot exceed 120 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters long"],
      maxlength: [120, "Location cannot exceed 120 characters"],
      index: true,
    },
    salary: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: salaryValidator,
        message: "Salary must be a string or a number",
      },
    },
    jobType: {
      type: String,
      enum: {
        values: ["full-time", "part-time", "remote"],
        message: "Job type must be full-time, part-time, or remote",
      },
      default: "full-time",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters long"],
    },
    requirements: {
      type: [String],
      default: [],
      set: cleanRequirements,
      validate: {
        validator: (values) =>
          Array.isArray(values) &&
          values.every(
            (value) => typeof value === "string" && value.trim().length > 0,
          ),
        message: "Requirements must be an array of non-empty strings",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job creator is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

jobSchema.index({ createdBy: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, location: 1, createdAt: -1 });

export default mongoose.model("Job", jobSchema);
