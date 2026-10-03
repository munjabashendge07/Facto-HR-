import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import Leave from "./models/Leave.js";
import Regularization from "./models/Regularization.js";
import Payroll from "./models/Payroll.js";
import Notification from "./models/Notification.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Regularization.deleteMany({});
    await Payroll.deleteMany({});
    await Notification.deleteMany({});

    console.log("Seeding Admin and Employees...");

    // Compute tomorrow's date for Vishwajeet's DOB to guarantee Requirement 3 (Birthday Notification Tomorrow)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMonthStr = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tomorrowDayStr = String(tomorrow.getDate()).padStart(2, "0");
    const vishwajeetDob = `1997-${tomorrowMonthStr}-${tomorrowDayStr}`;

    // 1. Create Admin (Munjaba)
    const adminUser = new User({
      name: "Munjaba Shendge",
      employeeId: "ADM001",
      email: "munjaba@factohr.com",
      password: "Munjaba@123",
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
    });
    await adminUser.save();

    // 2. Create Primary Employee (Vishwajeet)
    const vishwajeetUser = new User({
      name: "Vishwajeet Jamdade",
      employeeId: "EMP001",
      email: "vishwajeet@factohr.com",
      password: "Vishwajeet@123",
      role: "Employee",
      department: "Engineering",
      designation: "Senior Full Stack Engineer",
      phone: "+91 91234 56789",
      salary: 85000,
      dob: vishwajeetDob, // Birthday is Tomorrow!
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
      documents: [
        { title: "Aadhaar Card Copy", url: "https://example.com/docs/aadhaar.pdf" },
        { title: "PAN Card Copy", url: "https://example.com/docs/pan.pdf" },
        { title: "Offer Letter", url: "https://example.com/docs/offer.pdf" },
      ],
    });
    await vishwajeetUser.save();

    // 3. Additional Sample Employees
    const extraUsers = [
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
      },
    ];

    const seededExtraUsers = [];
    for (const u of extraUsers) {
      const newUser = new User(u);
      await newUser.save();
      seededExtraUsers.push(newUser);
    }

    // Sync Employee Collection
    const allUsersList = [adminUser, vishwajeetUser, ...seededExtraUsers];
    for (const u of allUsersList) {
      await Employee.create({
        employeeId: u.employeeId,
        user: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        department: u.department,
        designation: u.designation,
        salary: u.salary,
        dob: u.dob,
        gender: u.gender,
        address: u.address,
        joiningDate: u.joiningDate,
        bloodGroup: u.bloodGroup,
        aadhaarNumber: u.aadhaarNumber,
        panNumber: u.panNumber,
        profilePic: u.profilePic,
        documents: u.documents || [],
      });
    }

    console.log("Seeding Attendance Records...");
    const todayStr = new Date().toISOString().split("T")[0];

    // Seed Today's Attendance for Vishwajeet & Extra Users
    await Attendance.create({
      userId: vishwajeetUser._id,
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

    await Attendance.create({
      userId: seededExtraUsers[0]._id, // Priya
      date: todayStr,
      punchIn: {
        timestamp: new Date(new Date().setHours(9, 45, 0)), // Late
        lat: 18.5204,
        lng: 73.8567,
        distanceMeters: 45,
      },
      status: "Late",
      lateMark: true,
      workHours: 6.8,
    });

    console.log("Seeding Leave Requests...");
    await Leave.create({
      userId: vishwajeetUser._id,
      type: "Casual",
      startDate: new Date(new Date().setDate(now.getDate() + 5)),
      endDate: new Date(new Date().setDate(now.getDate() + 7)),
      reason: "Attending cousin's wedding in Gujarat.",
      status: "Pending",
    });

    await Leave.create({
      userId: seededExtraUsers[1]._id,
      type: "Sick",
      startDate: new Date(new Date().setDate(now.getDate() - 3)),
      endDate: new Date(new Date().setDate(now.getDate() - 2)),
      reason: "Viral fever and doctor rest recommendation.",
      status: "Approved",
      hrRemarks: "Approved with medical certificate.",
    });

    console.log("Seeding Attendance Regularization Request...");
    await Regularization.create({
      userId: vishwajeetUser._id,
      requestedPunchIn: new Date(new Date().setHours(9, 0, 0)),
      requestedPunchOut: new Date(new Date().setHours(18, 0, 0)),
      reason: "Bio-metric scanner malfunctioned at reception.",
      status: "Pending",
    });

    console.log("Seeding Payroll Slips...");
    const currentMonth = new Date().toISOString().slice(0, 7);
    for (const u of [vishwajeetUser, ...seededExtraUsers]) {
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

    console.log("Seeding Birthday Notification for HR/Admin...");
    await Notification.create({
      recipient: "ADMIN",
      title: "🎂 Upcoming Birthday Tomorrow!",
      message: `Vishwajeet Jamdade (${vishwajeetUser.department}) has a birthday tomorrow (${vishwajeetDob})!`,
      type: "BIRTHDAY",
      meta: {
        employeeName: vishwajeetUser.name,
        date: vishwajeetDob,
      },
    });

    console.log("==========================================");
    console.log("🎉 Database Seed Completed Successfully!");
    console.log("------------------------------------------");
    console.log("ADMIN LOGIN:");
    console.log("  Email:    munjaba@factohr.com");
    console.log("  Password: Munjaba@123");
    console.log("------------------------------------------");
    console.log("EMPLOYEE LOGIN:");
    console.log("  Email:    vishwajeet@factohr.com");
    console.log("  Password: Vishwajeet@123");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
