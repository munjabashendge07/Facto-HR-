import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardStats);
router.get("/", protect, getDashboardStats);

export default router;