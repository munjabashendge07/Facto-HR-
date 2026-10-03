import express from "express";
import {
  generatePayroll,
  getAllPayroll,
  getMySalarySlips,
} from "../controllers/payController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/generate", adminOnly, generatePayroll);
router.get("/all", adminOnly, getAllPayroll);
router.get("/my-slips", getMySalarySlips);
router.get("/", getAllPayroll);

export default router;