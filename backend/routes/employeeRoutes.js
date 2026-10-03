import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth and Admin role protection to all employee admin endpoints
router.use(protect);
router.use(authorize("Admin"));

router.route("/").get(getEmployees).post(createEmployee);
router.route("/:id").put(updateEmployee).delete(deleteEmployee);

export default router;