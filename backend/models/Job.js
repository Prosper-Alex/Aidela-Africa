import mongoose from "mongoose";

const { Schema } = mongoose;

const cleanRequirements = (values) => {
  if (!Array.isArray(values)) {
    return values;
  }

  return values
    .map((value) => (typeof value === "string" ? value.trim() : value))
    .filter(Boolean);
};

const salarySchema = new Schema(
  {
    min: {
      type: Number,
      min: [0, "Minimum salary must be a positive number"],
      default: null,
    },
    max: {
      type: Number,
      min: [0, "Maximum salary must be a positive number"],
      default: null,
    },
    currency: {
      type: String,
      trim: true,
      default: "USD",
      uppercase: true,
      minlength: [3, "Currency code must be at least 3 characters"],
      maxlength: [5, "Currency code cannot exceed 5 characters"],
    },
  },
  { _id: false },
);

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
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: "Remote",
      minlength: [2, "Location must be at least 2 characters long"],
      maxlength: [120, "Location cannot exceed 120 characters"],
      index: true,
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Remote"],
      default: "Full-time",
      index: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters long"],
    },
    additionalInfo: {
      type: String,
      trim: true,
      default: "",
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
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job creator is required"],
      index: true,
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: [0, "Applications count cannot be negative"],
    },
    expiresAt: {
      type: Date,
      default: null,
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
jobSchema.index({ status: 1, isPublished: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, location: 1 });
jobSchema.index({ isFeatured: 1, status: 1 });

jobSchema.path("salary").validate(function (salary) {
  if (!salary) return true;

  const { min, max } = salary;
  if (min != null && max != null) {
    return min <= max;
  }

  return true;
}, "Salary max must be greater than or equal to min.");

export default mongoose.model("Job", jobSchema);
