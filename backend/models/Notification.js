import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String, // 'ALL', 'ADMIN', or User ObjectId string
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BIRTHDAY", "LEAVE", "REGULARIZATION", "PAYROLL", "SYSTEM"],
      default: "SYSTEM",
    },
    read: {
      type: Boolean,
      default: false,
    },
    meta: {
      employeeName: String,
      date: String,
      link: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
