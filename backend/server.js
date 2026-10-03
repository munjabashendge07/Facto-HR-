import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import regularizationRoutes from "./routes/regularizationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

connectDB();

const app = express();

// Security: Express Body Parser & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security: Prevent MongoDB Operator / Query Injection Attacks
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Security: Custom XSS & Input Sanitization Middleware
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/regularization", regularizationRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("FactoHR Enterprise API Running with Security, Geofencing & RBAC...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FactoHR Enterprise Server running on port ${PORT}`);
});