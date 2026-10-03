import express from "express";
import {
  getNotifications,
  markNotificationRead,
  getBirthdayNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/birthdays", getBirthdayNotifications);
router.put("/:id/read", markNotificationRead);

export default router;
