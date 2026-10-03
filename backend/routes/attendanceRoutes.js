import express from "express";
import {
  punchIn,
  punchOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
} from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/punch-in", punchIn);
router.post("/punch-out", punchOut);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/all", adminOnly, getAllAttendance);

export default router;