import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    punchIn: {
      timestamp: { type: Date },
      lat: { type: Number },
      lng: { type: Number },
      distanceMeters: { type: Number },
    },
    punchOut: {
      timestamp: { type: Date },
      lat: { type: Number },
      lng: { type: Number },
      distanceMeters: { type: Number },
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Half-Day", "Absent"],
      default: "Present",
    },
    lateMark: {
      type: Boolean,
      default: false,
    },
    lateReason: {
      type: String,
      default: "",
    },
    workHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;