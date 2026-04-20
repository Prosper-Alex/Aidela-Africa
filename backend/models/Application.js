import mongoose from "mongoose";

const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
      index: true,
    },
    resume: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Resume cannot exceed 5000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Status must be pending, accepted, or rejected",
      },
      default: "pending",
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

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });
applicationSchema.index({ user: 1, status: 1, createdAt: -1 });

export default mongoose.model("Application", applicationSchema);
