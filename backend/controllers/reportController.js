import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

// @desc    Get dashboard & analytics reports (Admin)
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getAdminReports = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const employees = await User.find({ role: "Employee" }).select("-password").sort({ name: 1 });
    const attendanceRecords = await Attendance.find().populate("userId", "name email employeeId department designation").sort({ date: -1 });
    const leaveRecords = await Leave.find().populate("userId", "name email employeeId department designation").sort({ createdAt: -1 });
    const payrollRecords = await Payroll.find().populate("userId", "name email employeeId department designation").sort({ month: -1 });

    const totalEmployees = employees.length;
    const todayAttendance = attendanceRecords.filter((a) => a.date === todayStr);

    const presentToday = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    const lateToday = todayAttendance.filter((a) => a.lateMark || a.status === "Late").length;
    const absentToday = Math.max(0, totalEmployees - presentToday);
    const pendingLeavesCount = leaveRecords.filter((l) => l.status === "Pending").length;

    return res.json({
      summary: {
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
        pendingLeavesCount,
        totalPayrollRecords: payrollRecords.length,
      },
      employees,
      attendance: attendanceRecords,
      leaves: leaveRecords,
      payroll: payrollRecords,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
