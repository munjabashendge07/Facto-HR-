import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      default: "",
    },
    employeeName: {
      type: String,
      default: "",
    },
    month: {
      type: String, // YYYY-MM
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Paid",
    },
    paidDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);