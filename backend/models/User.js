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
  // Prevent double hashing if already a bcrypt hash
  if (typeof this.password === "string" && (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;

  // 1. Direct match
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  if (isMatch) return true;

  // 2. Fallback: Lowercase (e.g., Munjaba@123 vs munjaba@123)
  if (enteredPassword.toLowerCase() !== enteredPassword) {
    const isLowerMatch = await bcrypt.compare(enteredPassword.toLowerCase(), this.password);
    if (isLowerMatch) return true;
  }

  // 3. Fallback: Capitalized first character (e.g., munjaba@123 vs Munjaba@123)
  const capitalized = enteredPassword.charAt(0).toUpperCase() + enteredPassword.slice(1);
  if (capitalized !== enteredPassword) {
    const isCapMatch = await bcrypt.compare(capitalized, this.password);
    if (isCapMatch) return true;
  }

  return false;
};

const User = mongoose.model("User", userSchema);
export default User;