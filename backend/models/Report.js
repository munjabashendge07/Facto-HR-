import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Attendance", "Leave", "Payroll", "Employee"],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    month: String,
    dataSummary: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
