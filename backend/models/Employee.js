import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: String,
    department: String,
    designation: String,
    salary: Number,
    dob: String,
    gender: String,
    address: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    joiningDate: String,
    bloodGroup: String,
    aadhaarNumber: String,
    panNumber: String,
    profilePic: String,
    documents: [
      {
        title: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Employee", employeeSchema);