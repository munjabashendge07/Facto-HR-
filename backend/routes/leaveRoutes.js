import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", applyLeave);
router.get("/my-leaves", getMyLeaves);

// Admin-only routes
router.get("/all", authorize("Admin"), getAllLeaves);
router.put("/:id/status", authorize("Admin"), updateLeaveStatus);

export default router;