import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Regularization from "../models/Regularization.js";
import Payroll from "../models/Payroll.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";

export const seedDefaultUsers = async () => {
  try {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || "munjaba@123";
    const employeePassword = process.env.EMPLOYEE_SEED_PASSWORD || "vishwajeet@123";

    const defaultUsers = [
      {
        name: "Munjaba Shendge",
        employeeId: "ADM001",
        email: "munjaba@factohr.com",
        password: adminPassword,
        role: "Admin",
        department: "HR & Management",
        designation: "HR Director",
        phone: "+91 98765 43210",
        salary: 120000,
        dob: "1988-08-15",
        gender: "Male",
        address: "101 Executive Enclave, Pune, MH",
        joiningDate: "2020-01-01",
        bloodGroup: "O+",
        aadhaarNumber: "1234-5678-9012",
        panNumber: "ABCDE1234F",
        profilePic: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
        officeLocation: { lat: 18.5204, lng: 73.8567 },
        geofenceRadiusMeters: 200,
      },
      {
        name: "Vishwajeet Jamdade",
        employeeId: "EMP001",
        email: "vishwajeet@factohr.com",
        password: employeePassword,
        role: "Employee",
        department: "Engineering",
        designation: "Senior Full Stack Engineer",
        phone: "+91 91234 56789",
        salary: 85000,
        dob: "1997-09-04",
        gender: "Male",
        address: "402 Silicon Heights, Baner, Pune",
        emergencyContact: {
          name: "Suresh Jamdade",
          relationship: "Father",
          phone: "+91 98989 89898",
        },
        joiningDate: "2022-03-15",
        bloodGroup: "B+",
        aadhaarNumber: "9876-5432-1098",
        panNumber: "VWXYZ9876K",
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        officeLocation: { lat: 18.5204, lng: 73.8567 },
        geofenceRadiusMeters: 150,
      },
      {
        name: "Priya Nair",
        employeeId: "EMP002",
        email: "priya.nair@factohr.com",
        password: "Priya@123",
        role: "Employee",
        department: "Marketing",
        designation: "Marketing Lead",
        salary: 68000,
        dob: "1995-11-20",
        gender: "Female",
        address: "A-12 Green Acres, Pune",
        profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        officeLocation: { lat: 18.5204, lng: 73.8567 },
        geofenceRadiusMeters: 150,
      },
      {
        name: "Rahul Verma",
        employeeId: "EMP003",
        email: "rahul.verma@factohr.com",
        password: "Rahul@123",
        role: "Employee",
        department: "Finance",
        designation: "Financial Analyst",
        salary: 72000,
        dob: "1994-06-12",
        gender: "Male",
        address: "704 Silver Towers, Hinjewadi, Pune",
        profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        officeLocation: { lat: 18.5204, lng: 73.8567 },
        geofenceRadiusMeters: 150,
      },
      {
        name: "Ananya Roy",
        employeeId: "EMP004",
        email: "ananya.roy@factohr.com",
        password: "Ananya@123",
        role: "Employee",
        department: "Sales",
        designation: "Enterprise Sales Spec",
        salary: 62000,
        dob: "1999-01-25",
        gender: "Female",
        address: "203 Park View, Pune",
        profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        officeLocation: { lat: 18.5204, lng: 73.8567 },
        geofenceRadiusMeters: 150,
      },
    ];

    const seededUsers = [];

    for (const data of defaultUsers) {
      const emailLower = data.email.toLowerCase();
      let user = await User.findOne({ email: emailLower });

      if (!user) {
        user = await User.findOne({ employeeId: data.employeeId });
      }

      if (!user) {
        user = new User(data);
        await user.save();
        console.log(`[AutoSeed] Created user: ${user.email} (${user.role})`);
      } else {
        // Safe sync: check if password matches
        const matchesCurrent = await user.matchPassword(data.password);
        if (!matchesCurrent) {
          user.password = data.password;
          await user.save();
          console.log(`[AutoSeed] Synchronized password for: ${user.email}`);
        }
      }

      seededUsers.push(user);

      // Safe sync to Employee collection
      const empData = {
        employeeId: user.employeeId,
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        department: user.department || "General",
        designation: user.designation || "Staff",
        salary: user.salary || 50000,
        dob: user.dob || "1995-01-01",
        gender: user.gender || "Male",
        address: user.address || "",
        emergencyContact: user.emergencyContact || {},
        joiningDate: user.joiningDate || "2023-01-01",
        bloodGroup: user.bloodGroup || "O+",
        aadhaarNumber: user.aadhaarNumber || "",
        panNumber: user.panNumber || "",
        profilePic: user.profilePic || "",
        documents: user.documents || [],
      };

      await Employee.findOneAndUpdate(
        { employeeId: user.employeeId },
        { $set: empData },
        { upsert: true, returnDocument: "after" }
      );
    }

    // Check and seed initial sample attendance/payroll/notifications if empty
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0 && seededUsers.length > 1) {
      const todayStr = new Date().toISOString().split("T")[0];
      const vishwajeet = seededUsers.find((u) => u.employeeId === "EMP001") || seededUsers[1];
      if (vishwajeet) {
        await Attendance.create({
          userId: vishwajeet._id,
          date: todayStr,
          punchIn: {
            timestamp: new Date(new Date().setHours(9, 15, 0)),
            lat: 18.5204,
            lng: 73.8567,
            distanceMeters: 12,
          },
          status: "Present",
          workHours: 7.5,
        });
        console.log("[AutoSeed] Seeded initial attendance record.");
      }
    }

    const payrollCount = await Payroll.countDocuments();
    if (payrollCount === 0 && seededUsers.length > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      for (const u of seededUsers) {
        const base = u.salary || 60000;
        const basic = Math.round(base * 0.5);
        const hra = Math.round(base * 0.2);
        const allowances = Math.round(base * 0.2);
        const deductions = Math.round(base * 0.1);
        const net = basic + hra + allowances - deductions;

        await Payroll.create({
          userId: u._id,
          employeeId: u.employeeId,
          employeeName: u.name,
          month: currentMonth,
          basicSalary: basic,
          hra,
          allowances,
          bonus: 2000,
          deductions,
          tax: Math.round(base * 0.05),
          netSalary: net + 2000,
          status: "Paid",
          paidDate: new Date(),
        });
      }
      console.log("[AutoSeed] Seeded initial payroll records.");
    }

    const notificationCount = await Notification.countDocuments();
    if (notificationCount === 0) {
      await Notification.create({
        recipient: "ADMIN",
        title: "System Initialization",
        message: "FactoHR Enterprise System initialized and ready for production use.",
        type: "SYSTEM",
      });
      console.log("[AutoSeed] Seeded initial system notification.");
    }

    console.log("[AutoSeed] Database verified: Admin and Employee accounts ready.");
  } catch (error) {
    console.error("[AutoSeed] Error verifying default users:", error.message);
  }
};
