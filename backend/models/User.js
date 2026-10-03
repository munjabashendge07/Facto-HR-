import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Employee"],
      default: "Employee",
    },
    phone: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "Engineering",
    },
    designation: {
      type: String,
      default: "Software Engineer",
    },
    salary: {
      type: Number,
      default: 50000,
    },
    dob: {
      type: String, // YYYY-MM-DD
      default: "1998-05-15",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    address: {
      type: String,
      default: "123 Tech Park, Innovation Way",
    },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    joiningDate: {
      type: String, // YYYY-MM-DD
      default: "2023-01-10",
    },
    bloodGroup: {
      type: String,
      default: "O+",
    },
    aadhaarNumber: {
      type: String,
      default: "",
    },
    panNumber: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    documents: [
      {
        title: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    officeLocation: {
      lat: {
        type: Number,
        default: 18.5204,
      },
      lng: {
        type: Number,
        default: 73.8567,
      },
    },
    geofenceRadiusMeters: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose async pre-save hook
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;