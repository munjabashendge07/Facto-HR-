import mongoose from "mongoose";

const regularizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
    requestedPunchIn: {
      type: Date,
    },
    requestedPunchOut: {
      type: Date,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    hrRemarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Regularization = mongoose.model("Regularization", regularizationSchema);
export default Regularization;
