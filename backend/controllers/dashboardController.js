import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Regularization from "../models/Regularization.js";
import Payroll from "../models/Payroll.js";

export const getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonthStr = new Date().toISOString().slice(0, 7);

    // 1. Employee counts
    const totalEmployees = await User.countDocuments({ role: "Employee" });

    // 2. Attendance stats today
    const todayAttendance = await Attendance.find({ date: todayStr });
    const presentToday = todayAttendance.filter((a) => a.status === "Present").length;
    const lateArrivals = todayAttendance.filter((a) => a.lateMark || a.status === "Late").length;
    const halfDays = todayAttendance.filter((a) => a.status === "Half-Day").length;
    
    // Absent = Total Employees - Present - Late - HalfDay
    const markedCount = presentToday + lateArrivals + halfDays;
    const absentToday = Math.max(0, totalEmployees - markedCount);

    // 3. Pending requests
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const pendingRegularizations = await Regularization.countDocuments({ status: "Pending" });

    // 4. Monthly Payroll total
    const payrollRecords = await Payroll.find({ month: currentMonthStr });
    let monthlyPayrollTotal = payrollRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    // If no payroll generated yet for this month, calculate estimated total from user salaries
    if (monthlyPayrollTotal === 0 && totalEmployees > 0) {
      const allEmps = await User.find({ role: "Employee" });
      monthlyPayrollTotal = allEmps.reduce((sum, e) => sum + (e.salary || 50000), 0);
    }

    // 5. Birthday detection (Tomorrow & Upcoming 7 days)
    const allUsers = await User.find({ role: "Employee" }).select("name email dob department designation profilePic");
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowMonthDay = `${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const todayMonthDay = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const upcomingBirthdays = [];
    let birthdayTomorrowCount = 0;

    allUsers.forEach((emp) => {
      if (!emp.dob) return;
      // dob format expected YYYY-MM-DD
      const parts = emp.dob.split("-");
      if (parts.length < 3) return;
      const empMonthDay = `${parts[1]}-${parts[2]}`;

      const isToday = empMonthDay === todayMonthDay;
      const isTomorrow = empMonthDay === tomorrowMonthDay;

      if (isTomorrow) {
        birthdayTomorrowCount++;
      }

      // Check if birthday falls in next 7 days
      let daysAway = -1;
      const bdayThisYear = new Date(now.getFullYear(), Number(parts[1]) - 1, Number(parts[2]));
      const diffTime = bdayThisYear.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        daysAway = diffDays;
        upcomingBirthdays.push({
          _id: emp._id,
          name: emp.name,
          dob: emp.dob,
          department: emp.department,
          designation: emp.designation,
          profilePic: emp.profilePic,
          isToday,
          isTomorrow,
          daysAway,
        });
      }
    });

    // 6. Department-wise distribution
    const deptAggregation = await User.aggregate([
      { $match: { role: "Employee" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    // 7. Leave status stats
    const leaveStats = {
      Pending: pendingLeaves,
      Approved: await Leave.countDocuments({ status: "Approved" }),
      Rejected: await Leave.countDocuments({ status: "Rejected" }),
    };

    // 8. Attendance 7-day trend history
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const dayRecords = await Attendance.find({ date: dateStr });
      const pres = dayRecords.filter((r) => r.status === "Present").length;
      const late = dayRecords.filter((r) => r.lateMark || r.status === "Late").length;
      const abs = Math.max(0, totalEmployees - (pres + late));

      last7Days.push({
        date: dateStr,
        day: dayName,
        present: pres,
        late: late,
        absent: abs,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        lateArrivals,
        pendingLeaves,
        pendingRegularizations,
        monthlyPayrollTotal,
        upcomingBirthdaysCount: upcomingBirthdays.length,
        birthdayTomorrowCount,
        upcomingBirthdays,
        departmentDistribution: deptAggregation,
        leaveStats,
        attendanceTrend: last7Days,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};