import React, { useState, useEffect } from "react";
import API from "../services/api";
import EmployeeModal from "../components/EmployeeModal";
import {
  AttendanceChart,
  DepartmentChart,
  LeaveStatsChart,
  PayrollTrendsChart,
} from "../components/ChartComponents";
import { exportToExcel, exportToPDF, downloadSalarySlipPDF } from "../utils/reportExport";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  FileText,
  CircleDollarSign,
  Cake,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Calendar,
  Sparkles,
  MapPin,
} from "lucide-react";
import confetti from "canvas-confetti";

const AdminDashboard = ({ activeTab = "dashboard" }) => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [reportsData, setReportsData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Employee Modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // HR Remarks Modal State
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", id: "", remarks: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, empRes, attRes, leaveRes, regRes, payRes, repRes] = await Promise.allSettled([
        API.get("/dashboard/summary"),
        API.get("/admin/employees"),
        API.get("/attendance/all"),
        API.get("/leaves/all"),
        API.get("/regularization/all"),
        API.get("/payroll/all"),
        API.get("/admin/reports"),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (empRes.status === "fulfilled") setEmployees(empRes.value.data);
      if (attRes.status === "fulfilled") setAttendance(attRes.value.data);
      if (leaveRes.status === "fulfilled") setLeaves(leaveRes.value.data);
      if (regRes.status === "fulfilled") setRegularizations(regRes.value.data);
      if (payRes.status === "fulfilled") setPayrolls(payRes.value.data.payroll || []);
      if (repRes.status === "fulfilled") setReportsData(repRes.value.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Employee CRUD Handlers
  const handleSaveEmployee = async (formData) => {
    try {
      if (selectedEmployee) {
        await API.put(`/admin/employees/${selectedEmployee._id}`, formData);
      } else {
        await API.post("/admin/employees", formData);
      }
      setIsEmployeeModalOpen(false);
      setSelectedEmployee(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save employee");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await API.delete(`/admin/employees/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  // Leave Status Handler
  const handleLeaveAction = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status, hrRemarks: actionModal.remarks });
      setActionModal({ isOpen: false, type: "", id: "", remarks: "" });
      fetchData();
    } catch (err) {
      alert("Failed to update leave status");
    }
  };

  // Regularization Status Handler
  const handleRegularizationAction = async (id, status) => {
    try {
      await API.put(`/regularization/${id}/status`, { status, hrRemarks: actionModal.remarks });
      setActionModal({ isOpen: false, type: "", id: "", remarks: "" });
      fetchData();
    } catch (err) {
      alert("Failed to update regularization status");
    }
  };

  // Payroll Batch Generation
  const handleGeneratePayroll = async () => {
    const month = prompt("Enter Payroll Month (YYYY-MM):", new Date().toISOString().slice(0, 7));
    if (!month) return;
    try {
      const res = await API.post("/payroll/generate", { month });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Failed to generate payroll");
    }
  };

  // Filtered Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === "ALL" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="fade-in">
      {/* 13. Dashboard Welcome Section */}
      {activeTab === "dashboard" && (
        <>
          <div className="welcome-banner">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={24} style={{ color: "#fbbf24" }} />
                <h1 className="welcome-title">Welcome Back, Munjaba 👋</h1>
              </div>
              <p style={{ opacity: 0.9, fontSize: "0.95rem" }}>
                Here is your real-time FactoHR enterprise summary for today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}.
              </p>

              <div className="welcome-summary-list">
                <div className="summary-pill">
                  <UserCheck size={16} style={{ color: "#34d399" }} />
                  <span>Present: {stats?.presentToday ?? 0}</span>
                </div>
                <div className="summary-pill">
                  <UserX size={16} style={{ color: "#f87171" }} />
                  <span>Absent: {stats?.absentToday ?? 0}</span>
                </div>
                <div className="summary-pill">
                  <FileText size={16} style={{ color: "#fbbf24" }} />
                  <span>Pending Leaves: {stats?.pendingLeaves ?? 0}</span>
                </div>
                <div className="summary-pill">
                  <Clock size={16} style={{ color: "#c084fc" }} />
                  <span>Pending Regularizations: {stats?.pendingRegularizations ?? 0}</span>
                </div>
                <div className="summary-pill">
                  <Cake size={16} style={{ color: "#f472b6" }} />
                  <span>Birthdays: {stats?.birthdayTomorrowCount ?? 0} Tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Birthday Notification Card */}
          {stats?.upcomingBirthdays?.some((b) => b.isTomorrow || b.isToday) && (
            <div className="birthday-card">
              <div className="birthday-card-content">
                <div className="birthday-icon-badge">🎂</div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                    Upcoming Birthday Tomorrow!
                  </h3>
                  <p style={{ fontSize: "0.9rem", opacity: 0.95, marginTop: "0.2rem" }}>
                    {stats.upcomingBirthdays
                      .filter((b) => b.isTomorrow || b.isToday)
                      .map((b) => `${b.name} (${b.department}) - DOB: ${b.dob}`)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ background: "#fff", color: "#be185d", fontWeight: 800 }}
                onClick={triggerConfetti}
              >
                🎉 Send Wishes
              </button>
            </div>
          )}

          {/* 4. 8 Animated Statistic Cards */}
          <div className="grid-stats">
            <div className="stat-card" style={{ "--card-accent": "#2563eb" }}>
              <div className="stat-info">
                <div className="stat-label">Total Employees</div>
                <div className="stat-value">{stats?.totalEmployees ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(37, 99, 235, 0.12)", "--icon-color": "#2563eb" }}>
                <Users size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
              <div className="stat-info">
                <div className="stat-label">Present Today</div>
                <div className="stat-value">{stats?.presentToday ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(16, 185, 129, 0.12)", "--icon-color": "#10b981" }}>
                <UserCheck size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#f43f5e" }}>
              <div className="stat-info">
                <div className="stat-label">Absent Today</div>
                <div className="stat-value">{stats?.absentToday ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(244, 63, 94, 0.12)", "--icon-color": "#f43f5e" }}>
                <UserX size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#f59e0b" }}>
              <div className="stat-info">
                <div className="stat-label">Late Arrivals</div>
                <div className="stat-value">{stats?.lateArrivals ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(245, 158, 11, 0.12)", "--icon-color": "#f59e0b" }}>
                <Clock size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#8b5cf6" }}>
              <div className="stat-info">
                <div className="stat-label">Pending Leaves</div>
                <div className="stat-value">{stats?.pendingLeaves ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(139, 92, 246, 0.12)", "--icon-color": "#8b5cf6" }}>
                <FileText size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#06b6d4" }}>
              <div className="stat-info">
                <div className="stat-label">Regularizations</div>
                <div className="stat-value">{stats?.pendingRegularizations ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(6, 182, 212, 0.12)", "--icon-color": "#06b6d4" }}>
                <Clock size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#10b981" }}>
              <div className="stat-info">
                <div className="stat-label">Monthly Payroll</div>
                <div className="stat-value">₹{(stats?.monthlyPayrollTotal || 0).toLocaleString()}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(16, 185, 129, 0.12)", "--icon-color": "#10b981" }}>
                <CircleDollarSign size={26} />
              </div>
            </div>

            <div className="stat-card" style={{ "--card-accent": "#ec4899" }}>
              <div className="stat-info">
                <div className="stat-label">Upcoming Birthdays</div>
                <div className="stat-value">{stats?.upcomingBirthdaysCount ?? 0}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ "--icon-bg": "rgba(236, 72, 153, 0.12)", "--icon-color": "#ec4899" }}>
                <Cake size={26} />
              </div>
            </div>
          </div>

          {/* 11. Chart.js Analytics Grid */}
          <div className="charts-grid">
            <div className="glass-card">
              <div className="card-header-flex">
                <h3 className="card-title">
                  <Calendar size={20} style={{ color: "#2563eb" }} /> Attendance Analytics
                </h3>
                <span className="badge badge-info">7-Day Trend</span>
              </div>
              <AttendanceChart data={stats?.attendanceTrend || []} />
            </div>

            <div className="glass-card">
              <div className="card-header-flex">
                <h3 className="card-title">
                  <Users size={20} style={{ color: "#8b5cf6" }} /> Department Distribution
                </h3>
                <span className="badge badge-info">Headcount</span>
              </div>
              <DepartmentChart data={stats?.departmentDistribution || []} />
            </div>

            <div className="glass-card">
              <div className="card-header-flex">
                <h3 className="card-title">
                  <FileText size={20} style={{ color: "#f59e0b" }} /> Leave Request Stats
                </h3>
                <span className="badge badge-warning">Current Status</span>
              </div>
              <LeaveStatsChart stats={stats?.leaveStats || {}} />
            </div>

            <div className="glass-card">
              <div className="card-header-flex">
                <h3 className="card-title">
                  <CircleDollarSign size={20} style={{ color: "#10b981" }} /> Monthly Payroll Cost
                </h3>
                <span className="badge badge-success">Expenditure</span>
              </div>
              <PayrollTrendsChart totalPayroll={stats?.monthlyPayrollTotal} />
            </div>
          </div>
        </>
      )}

      {/* 2. Employee Directory Tab */}
      {activeTab === "employees" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <Users size={22} style={{ color: "#2563eb" }} /> Employee Management Directory
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Manage all {employees.length} company employees, job roles, salary, and profiles.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedEmployee(null);
                setIsEmployeeModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <Search
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Search by employee name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={18} style={{ color: "var(--text-muted)" }} />
              <select
                className="form-select"
                style={{ width: "200px" }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="HR & Management">HR & Management</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary (₹)</th>
                  <th>DOB</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {emp.profilePic ? (
                            <img src={emp.profilePic} alt={emp.name} className="avatar-img" />
                          ) : (
                            <div className="avatar-fallback">{emp.name.charAt(0)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 800 }}>{emp.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{emp.employeeId || "EMP"}</span>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.designation}</td>
                      <td style={{ fontWeight: 700 }}>₹{(emp.salary || 50000).toLocaleString()}</td>
                      <td>{emp.dob || "N/A"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: "0.4rem 0.6rem" }}
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsEmployeeModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-danger"
                            style={{ padding: "0.4rem 0.6rem" }}
                            onClick={() => handleDeleteEmployee(emp._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Attendance Control Tab */}
      {activeTab === "attendance" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <MapPin size={22} style={{ color: "#10b981" }} /> Geofenced Attendance Control
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Real-time employee punch logs with late mark detection and GPS geofence verification.
              </p>
            </div>
            <span className="badge badge-success">Live Office Coordinates: 18.5204° N, 73.8567° E</span>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Punch In Time</th>
                  <th>Punch Out Time</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Geofence Distance</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => (
                    <tr key={att._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{att.userId?.name || "Employee"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {att.userId?.department || "Staff"}
                        </div>
                      </td>
                      <td>{att.date}</td>
                      <td>
                        {att.punchIn?.timestamp
                          ? new Date(att.punchIn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "--:--"}
                      </td>
                      <td>
                        {att.punchOut?.timestamp
                          ? new Date(att.punchOut.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "--:--"}
                      </td>
                      <td style={{ fontWeight: 700 }}>{att.workHours ? `${att.workHours} hrs` : "-"}</td>
                      <td>
                        <span
                          className={`badge ${att.status === "Present"
                              ? "badge-success"
                              : att.status === "Late"
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                        >
                          {att.status} {att.lateMark && "(Late Mark)"}
                        </span>
                      </td>
                      <td>{att.punchIn?.distanceMeters ? `${att.punchIn.distanceMeters}m from office` : "Verified"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Leave Approvals Tab */}
      {activeTab === "leaves" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <FileText size={22} style={{ color: "#f59e0b" }} /> Leave Management & Approvals
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Review, approve, or reject employee leave applications with HR remarks.
              </p>
            </div>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{l.userId?.name || "Employee"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{l.userId?.department}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{l.type}</span>
                      </td>
                      <td>
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ maxWidth: "250px" }}>{l.reason}</td>
                      <td>
                        <span
                          className={`badge ${l.status === "Approved"
                              ? "badge-success"
                              : l.status === "Rejected"
                                ? "badge-danger"
                                : "badge-warning"
                            }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn-success"
                              onClick={() => {
                                setActionModal({ isOpen: true, type: "leave_approve", id: l._id, remarks: "" });
                              }}
                            >
                              <CheckCircle size={15} /> Approve
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => {
                                setActionModal({ isOpen: true, type: "leave_reject", id: l._id, remarks: "" });
                              }}
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {l.hrRemarks || "Decision finalized"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Attendance Regularization Tab */}
      {activeTab === "regularization" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <Clock size={22} style={{ color: "#8b5cf6" }} /> Attendance Regularization Requests
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Review employee punch correction requests and update attendance logs on approval.
              </p>
            </div>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Requested In</th>
                  <th>Requested Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regularizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No regularization requests found.
                    </td>
                  </tr>
                ) : (
                  regularizations.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{r.userId?.name || "Employee"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{r.userId?.department}</div>
                      </td>
                      <td>
                        {r.requestedPunchIn
                          ? new Date(r.requestedPunchIn).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>
                        {r.requestedPunchOut
                          ? new Date(r.requestedPunchOut).toLocaleString()
                          : "N/A"}
                      </td>
                      <td style={{ maxWidth: "250px" }}>{r.reason}</td>
                      <td>
                        <span
                          className={`badge ${r.status === "Approved"
                              ? "badge-success"
                              : r.status === "Rejected"
                                ? "badge-danger"
                                : "badge-warning"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn-success"
                              onClick={() => {
                                setActionModal({ isOpen: true, type: "reg_approve", id: r._id, remarks: "" });
                              }}
                            >
                              <CheckCircle size={15} /> Approve
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => {
                                setActionModal({ isOpen: true, type: "reg_reject", id: r._id, remarks: "" });
                              }}
                            >
                              <XCircle size={15} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {r.hrRemarks || "Decision finalized"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Payroll Module Tab */}
      {activeTab === "payroll" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <CircleDollarSign size={22} style={{ color: "#10b981" }} /> Payroll Management & Salary Slips
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Generate monthly salary disbursements, review basic/HRA/deductions breakdown, and export payslips.
              </p>
            </div>
            <button className="btn-primary" onClick={handleGeneratePayroll}>
              <Plus size={18} />
              <span>Generate Monthly Payroll</span>
            </button>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic Salary</th>
                  <th>HRA & Allowances</th>
                  <th>Deductions / Tax</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No payroll records generated yet. Click "Generate Monthly Payroll" above.
                    </td>
                  </tr>
                ) : (
                  payrolls.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>{p.userId?.name || p.employeeName}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {p.userId?.employeeId || p.employeeId}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{p.month}</span>
                      </td>
                      <td>₹{(p.basicSalary || 0).toLocaleString()}</td>
                      <td>₹{((p.hra || 0) + (p.allowances || 0) + (p.bonus || 0)).toLocaleString()}</td>
                      <td style={{ color: "#f43f5e" }}>-₹{(p.deductions || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: "#10b981", fontSize: "1.05rem" }}>
                        ₹{(p.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-success">PAID</span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.82rem" }}
                          onClick={() => downloadSalarySlipPDF(p, p.userId || { name: p.employeeName })}
                        >
                          <Download size={14} /> PDF Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. Reports & Analytics Export Tab */}
      {activeTab === "reports" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <Download size={22} style={{ color: "#2563eb" }} /> Enterprise Reports & Data Export
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Export comprehensive system reports to Excel (.xlsx) or formatted PDF documents.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Attendance Report */}
            <div style={{ background: "var(--bg-main)", padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>Attendance Report</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Full breakdown of daily punch-in, punch-out, late marks, and total worked hours.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const headers = ["Employee", "Date", "Punch In", "Punch Out", "Status"];
                    const rows = attendance.map((a) => [
                      a.userId?.name || "Emp",
                      a.date,
                      a.punchIn?.timestamp ? new Date(a.punchIn.timestamp).toLocaleTimeString() : "-",
                      a.punchOut?.timestamp ? new Date(a.punchOut.timestamp).toLocaleTimeString() : "-",
                      a.status,
                    ]);
                    exportToPDF("Attendance Log Report", headers, rows, "Attendance_Report");
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const data = attendance.map((a) => ({
                      Employee: a.userId?.name || "Emp",
                      Date: a.date,
                      PunchIn: a.punchIn?.timestamp ? new Date(a.punchIn.timestamp).toLocaleTimeString() : "-",
                      PunchOut: a.punchOut?.timestamp ? new Date(a.punchOut.timestamp).toLocaleTimeString() : "-",
                      Status: a.status,
                      LateMark: a.lateMark ? "Yes" : "No",
                    }));
                    exportToExcel(data, "Attendance_Report");
                  }}
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Leave Report */}
            <div style={{ background: "var(--bg-main)", padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>Leave Log Report</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Summary of leaves applied, type (Sick/Casual/Paid), status, and HR approvals.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const headers = ["Employee", "Type", "Start Date", "End Date", "Status"];
                    const rows = leaves.map((l) => [
                      l.userId?.name || "Emp",
                      l.type,
                      new Date(l.startDate).toLocaleDateString(),
                      new Date(l.endDate).toLocaleDateString(),
                      l.status,
                    ]);
                    exportToPDF("Leave Applications Report", headers, rows, "Leave_Report");
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const data = leaves.map((l) => ({
                      Employee: l.userId?.name || "Emp",
                      LeaveType: l.type,
                      StartDate: new Date(l.startDate).toLocaleDateString(),
                      EndDate: new Date(l.endDate).toLocaleDateString(),
                      Reason: l.reason,
                      Status: l.status,
                    }));
                    exportToExcel(data, "Leave_Report");
                  }}
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Payroll Report */}
            <div style={{ background: "var(--bg-main)", padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>Payroll Summary Report</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Complete monthly salary slip ledger with basic pay, bonuses, and net disbursements.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const headers = ["Employee", "Month", "Basic", "Deductions", "Net Salary"];
                    const rows = payrolls.map((p) => [
                      p.userId?.name || p.employeeName,
                      p.month,
                      `₹${p.basicSalary}`,
                      `₹${p.deductions}`,
                      `₹${p.netSalary}`,
                    ]);
                    exportToPDF("Payroll Disbursement Ledger", headers, rows, "Payroll_Report");
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const data = payrolls.map((p) => ({
                      Employee: p.userId?.name || p.employeeName,
                      Month: p.month,
                      BasicSalary: p.basicSalary,
                      HRA: p.hra,
                      Allowances: p.allowances,
                      Bonus: p.bonus,
                      Deductions: p.deductions,
                      NetSalary: p.netSalary,
                    }));
                    exportToExcel(data, "Payroll_Report");
                  }}
                >
                  Export Excel
                </button>
              </div>
            </div>

            {/* Employee Master Report */}
            <div style={{ background: "var(--bg-main)", padding: "1.5rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.5rem" }}>Employee Directory Report</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                Master record of all employees, contact numbers, departments, and PAN/Aadhaar IDs.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const headers = ["ID", "Name", "Department", "Designation", "Phone"];
                    const rows = employees.map((e) => [e.employeeId || "EMP", e.name, e.department, e.designation, e.phone || "-"]);
                    exportToPDF("Employee Master Directory", headers, rows, "Employee_Directory");
                  }}
                >
                  Export PDF
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: "0.82rem" }}
                  onClick={() => {
                    const data = employees.map((e) => ({
                      ID: e.employeeId,
                      Name: e.name,
                      Email: e.email,
                      Department: e.department,
                      Designation: e.designation,
                      Salary: e.salary,
                      Phone: e.phone,
                      Aadhaar: e.aadhaarNumber,
                      PAN: e.panNumber,
                    }));
                    exportToExcel(data, "Employee_Directory");
                  }}
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Edit / Create Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSubmit={handleSaveEmployee}
        initialData={selectedEmployee}
      />

      {/* HR Action Modal for Approvals/Rejections */}
      {actionModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in" style={{ maxWidth: "450px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              {actionModal.type.includes("approve") ? "Approve Request" : "Reject Request"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Enter optional HR notes or remarks for this decision.
            </p>

            <div className="form-group">
              <label className="form-label">HR Remarks</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Approved as per company policy..."
                value={actionModal.remarks}
                onChange={(e) => setActionModal((prev) => ({ ...prev, remarks: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                className="btn-secondary"
                onClick={() => setActionModal({ isOpen: false, type: "", id: "", remarks: "" })}
              >
                Cancel
              </button>
              <button
                className={actionModal.type.includes("approve") ? "btn-success" : "btn-danger"}
                onClick={() => {
                  if (actionModal.type.startsWith("leave")) {
                    handleLeaveAction(
                      actionModal.id,
                      actionModal.type === "leave_approve" ? "Approved" : "Rejected"
                    );
                  } else {
                    handleRegularizationAction(
                      actionModal.id,
                      actionModal.type === "reg_approve" ? "Approved" : "Rejected"
                    );
                  }
                }}
              >
                Confirm {actionModal.type.includes("approve") ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
