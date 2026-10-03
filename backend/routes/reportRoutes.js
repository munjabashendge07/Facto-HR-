import express from "express";
import { getAdminReports } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/", getAdminReports);

export default router;
