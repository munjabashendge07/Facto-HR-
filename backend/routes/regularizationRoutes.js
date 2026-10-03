import express from "express";
import {
  requestRegularization,
  getMyRegularizations,
  getAllRegularizations,
  updateRegularizationStatus,
} from "../controllers/regularizationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", requestRegularization);
router.get("/my-requests", getMyRegularizations);

// Admin-only routes
router.get("/all", authorize("Admin"), getAllRegularizations);
router.put("/:id/status", authorize("Admin"), updateRegularizationStatus);

export default router;
