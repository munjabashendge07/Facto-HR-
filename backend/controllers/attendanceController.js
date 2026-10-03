import Attendance from "../models/Attendance.js";
import { calculateHaversineDistance } from "../utils/haversine.js";

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

// @desc    Punch In Attendance with Geofence check
// @route   POST /api/attendance/punch-in
// @access  Private (Employee / Admin)
export const punchIn = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Latitude and Longitude are required for Punch-In" });
    }

    const officeLat = req.user.officeLocation?.lat ?? 18.5204;
    const officeLng = req.user.officeLocation?.lng ?? 73.8567;
    const allowedRadius = req.user.geofenceRadiusMeters ?? 100;

    const distance = calculateHaversineDistance(lat, lng, officeLat, officeLng);

    // Geofence check: Reject if distance > radius
    if (distance > allowedRadius) {
      return res.status(403).json({
        message: `Punch-In denied: You are ${distance}m away from the office. Maximum allowed radius is ${allowedRadius}m.`,
        distanceMeters: distance,
        allowedRadiusMeters: allowedRadius,
      });
    }

    const todayStr = getTodayDateString();
    let attendance = await Attendance.findOne({ userId: req.user._id, date: todayStr });

    if (attendance && attendance.punchIn?.timestamp) {
      return res.status(400).json({ message: "You have already punched in for today." });
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Standard time threshold: 09:30 AM
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? "Late" : "Present";

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user._id,
        date: todayStr,
        punchIn: {
          timestamp: now,
          lat: Number(lat),
          lng: Number(lng),
          distanceMeters: distance,
        },
        status,
        lateMark: isLate,
      });
    } else {
      attendance.punchIn = {
        timestamp: now,
        lat: Number(lat),
        lng: Number(lng),
        distanceMeters: distance,
      };
      attendance.status = status;
      attendance.lateMark = isLate;
    }

    await attendance.save();

    return res.status(200).json({
      message: isLate ? "Punched in! (Late Mark Recorded)" : "Punch-In successful!",
      attendance,
      distanceMeters: distance,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Punch Out Attendance with Geofence check
// @route   POST /api/attendance/punch-out
// @access  Private (Employee / Admin)
export const punchOut = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Latitude and Longitude are required for Punch-Out" });
    }

    const officeLat = req.user.officeLocation?.lat ?? 18.5204;
    const officeLng = req.user.officeLocation?.lng ?? 73.8567;
    const allowedRadius = req.user.geofenceRadiusMeters ?? 100;

    const distance = calculateHaversineDistance(lat, lng, officeLat, officeLng);

    if (distance > allowedRadius) {
      return res.status(403).json({
        message: `Punch-Out denied: You are ${distance}m away from office. Allowed radius is ${allowedRadius}m.`,
        distanceMeters: distance,
        allowedRadiusMeters: allowedRadius,
      });
    }

    const todayStr = getTodayDateString();
    const attendance = await Attendance.findOne({ userId: req.user._id, date: todayStr });

    if (!attendance || !attendance.punchIn?.timestamp) {
      return res.status(400).json({ message: "You must punch in before punching out." });
    }

    if (attendance.punchOut?.timestamp) {
      return res.status(400).json({ message: "You have already punched out for today." });
    }

    const now = new Date();
    const workedMs = now.getTime() - new Date(attendance.punchIn.timestamp).getTime();
    const workedHours = Number((workedMs / (1000 * 60 * 60)).toFixed(2));

    attendance.punchOut = {
      timestamp: now,
      lat: Number(lat),
      lng: Number(lng),
      distanceMeters: distance,
    };
    attendance.workHours = workedHours;

    if (workedHours < 4 && attendance.status !== "Late") {
      attendance.status = "Half-Day";
    }

    await attendance.save();

    return res.status(200).json({
      message: "Punch-Out successful!",
      attendance,
      distanceMeters: distance,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
export const getTodayAttendance = async (req, res) => {
  try {
    const todayStr = getTodayDateString();
    const attendance = await Attendance.findOne({ userId: req.user._id, date: todayStr });
    return res.json(attendance || null);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's attendance history
// @route   GET /api/attendance/history
// @access  Private
export const getAttendanceHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ userId: req.user._id }).sort({ date: -1 });
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance/all
// @access  Private (Admin)
export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("userId", "name email employeeId department profilePic")
      .sort({ date: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};