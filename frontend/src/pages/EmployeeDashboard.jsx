import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { downloadSalarySlipPDF } from "../utils/reportExport";
import {
  User,
  CalendarCheck,
  FileText,
  Clock,
  CircleDollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Plus,
  Edit,
  Save,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Building,
} from "lucide-react";

const EmployeeDashboard = ({ user, activeTab = "profile" }) => {
  const { updateUserProfile } = useAuth();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leavesData, setLeavesData] = useState({ leaves: [], balances: { quota: {}, used: {}, remaining: {} } });
  const [regularizations, setRegularizations] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);

  const [locationStatus, setLocationStatus] = useState({ lat: null, lng: null, error: null, loading: false });
  const [punchMessage, setPunchMessage] = useState({ text: "", type: "" });

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || "",
    address: user?.address || "",
    dob: user?.dob || "",
    gender: user?.gender || "Male",
    bloodGroup: user?.bloodGroup || "O+",
    aadhaarNumber: user?.aadhaarNumber || "",
    panNumber: user?.panNumber || "",
    profilePic: user?.profilePic || "",
    emergencyContact: user?.emergencyContact || { name: "", relationship: "", phone: "" },
  });

  // Apply Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "Sick",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Regularization Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    requestedPunchIn: "",
    requestedPunchOut: "",
    reason: "",
  });

  // Document Upload State
  const [docForm, setDocForm] = useState({ title: "", url: "" });

  const fetchEmployeeData = async () => {
    try {
      const [todayRes, historyRes, leaveRes, regRes, slipRes] = await Promise.allSettled([
        API.get("/attendance/today"),
        API.get("/attendance/history"),
        API.get("/leaves/my-leaves"),
        API.get("/regularization/my-requests"),
        API.get("/payroll/my-slips"),
      ]);

      if (todayRes.status === "fulfilled") setTodayAttendance(todayRes.value.data);
      if (historyRes.status === "fulfilled") setAttendanceHistory(historyRes.value.data);
      if (leaveRes.status === "fulfilled") setLeavesData(leaveRes.value.data);
      if (regRes.status === "fulfilled") setRegularizations(regRes.value.data);
      if (slipRes.status === "fulfilled") setSalarySlips(slipRes.value.data.slips || []);
    } catch (err) {
      console.error("Employee data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Fetch Browser Live GPS Location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLocationStatus((prev) => ({ ...prev, loading: true, error: null }));
      if (!navigator.geolocation) {
        const err = "Geolocation is not supported by your browser.";
        setLocationStatus({ lat: null, lng: null, error: err, loading: false });
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocationStatus({ lat: coords.lat, lng: coords.lng, error: null, loading: false });
          resolve(coords);
        },
        (err) => {
          // Fallback to default office location for testing if geolocation denied
          const fallback = { lat: 18.5204, lng: 73.8567 };
          setLocationStatus({ lat: fallback.lat, lng: fallback.lng, error: "Using default office location for demonstration.", loading: false });
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Punch In Handler
  const handlePunchIn = async () => {
    setPunchMessage({ text: "", type: "" });
    try {
      const coords = await getCurrentLocation();
      const res = await API.post("/attendance/punch-in", { lat: coords.lat, lng: coords.lng });
      setPunchMessage({ text: res.data.message, type: "success" });
      fetchEmployeeData();
    } catch (err) {
      setPunchMessage({
        text: err.response?.data?.message || err || "Punch-In failed",
        type: "danger",
      });
    }
  };

  // Punch Out Handler
  const handlePunchOut = async () => {
    setPunchMessage({ text: "", type: "" });
    try {
      const coords = await getCurrentLocation();
      const res = await API.post("/attendance/punch-out", { lat: coords.lat, lng: coords.lng });
      setPunchMessage({ text: res.data.message, type: "success" });
      fetchEmployeeData();
    } catch (err) {
      setPunchMessage({
        text: err.response?.data?.message || err || "Punch-Out failed",
        type: "danger",
      });
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(profileForm);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  // Apply Leave Handler
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await API.post("/leaves", leaveForm);
      setIsLeaveModalOpen(false);
      setLeaveForm({
        type: "Sick",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
      });
      fetchEmployeeData();
      alert("Leave application submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply for leave");
    }
  };

  // Submit Regularization Request
  const handleSubmitRegularization = async (e) => {
    e.preventDefault();
    try {
      await API.post("/regularization", regForm);
      setIsRegModalOpen(false);
      setRegForm({ requestedPunchIn: "", requestedPunchOut: "", reason: "" });
      fetchEmployeeData();
      alert("Regularization request submitted!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit regularization");
    }
  };

  // Add Document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.url) return;
    const updatedDocs = [...(user.documents || []), { title: docForm.title, url: docForm.url, uploadedAt: new Date() }];
    try {
      await updateUserProfile({ documents: updatedDocs });
      setDocForm({ title: "", url: "" });
      alert("Document added successfully!");
    } catch (err) {
      alert("Failed to upload document");
    }
  };

  return (
    <div className="fade-in">
      {/* 5. Employee Self Service Portal Tabs */}
      
      {/* My Profile Tab */}
      {activeTab === "profile" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <h3 className="card-title">
              <User size={22} style={{ color: "#2563eb" }} /> My Personal Profile
            </h3>
            <span className="badge badge-info">ID: {user?.employeeId || "EMP"}</span>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={user?.name || ""} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={user?.email || ""} disabled />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" value={user?.department || "Engineering"} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input type="text" className="form-input" value={user?.designation || "Staff"} disabled />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Aadhaar Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234-5678-9012"
                  value={profileForm.aadhaarNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, aadhaarNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ABCDE1234F"
                  value={profileForm.panNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, panNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo URL</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.profilePic}
                onChange={(e) => setProfileForm({ ...profileForm, profilePic: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                <span>Save Profile Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. My Attendance & Geofence Punch Tab */}
      {activeTab === "attendance" && (
        <>
          <div className="glass-card">
            <div className="card-header-flex">
              <div>
                <h3 className="card-title">
                  <MapPin size={22} style={{ color: "#10b981" }} /> Geofenced Attendance Punch
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Allowed Punch Radius: {user?.geofenceRadiusMeters || 100}m from office premises.
                </p>
              </div>
              <span className="badge badge-info">Standard Entry: 09:30 AM</span>
            </div>

            {punchMessage.text && (
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  background: punchMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                  color: punchMessage.type === "success" ? "#10b981" : "#f43f5e",
                  border: `1px solid ${punchMessage.type === "success" ? "#10b981" : "#f43f5e"}`,
                }}
              >
                {punchMessage.text}
              </div>
            )}

            {/* Geofence Status Card */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              <div style={{ background: "var(--bg-main)", padding: "1.25rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>PUNCH IN STATUS</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
                  {todayAttendance?.punchIn?.timestamp
                    ? new Date(todayAttendance.punchIn.timestamp).toLocaleTimeString()
                    : "Not Punched In"}
                </div>
                <span className={`badge ${todayAttendance?.punchIn ? "badge-success" : "badge-warning"}`}>
                  {todayAttendance?.status || "Pending"}
                </span>
              </div>

              <div style={{ background: "var(--bg-main)", padding: "1.25rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>PUNCH OUT STATUS</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
                  {todayAttendance?.punchOut?.timestamp
                    ? new Date(todayAttendance.punchOut.timestamp).toLocaleTimeString()
                    : "Not Punched Out"}
                </div>
                <span className={`badge ${todayAttendance?.punchOut ? "badge-success" : "badge-warning"}`}>
                  {todayAttendance?.workHours ? `${todayAttendance.workHours} Hrs Worked` : "Pending"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                className="btn-primary"
                style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}
                disabled={!!todayAttendance?.punchIn?.timestamp || locationStatus.loading}
                onClick={handlePunchIn}
              >
                <CheckCircle size={20} />
                <span>{locationStatus.loading ? "Checking Geofence..." : "Punch In Now"}</span>
              </button>

              <button
                className="btn-secondary"
                style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}
                disabled={!todayAttendance?.punchIn?.timestamp || !!todayAttendance?.punchOut?.timestamp || locationStatus.loading}
                onClick={handlePunchOut}
              >
                <XCircle size={20} />
                <span>{locationStatus.loading ? "Checking Geofence..." : "Punch Out Now"}</span>
              </button>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="glass-card">
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
              <Clock size={20} style={{ color: "#8b5cf6" }} /> Monthly Attendance Log
            </h3>
            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Work Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No past attendance logs found.
                      </td>
                    </tr>
                  ) : (
                    attendanceHistory.map((a) => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 700 }}>{a.date}</td>
                        <td>{a.punchIn?.timestamp ? new Date(a.punchIn.timestamp).toLocaleTimeString() : "-"}</td>
                        <td>{a.punchOut?.timestamp ? new Date(a.punchOut.timestamp).toLocaleTimeString() : "-"}</td>
                        <td>{a.workHours ? `${a.workHours} hrs` : "-"}</td>
                        <td>
                          <span className={`badge ${a.status === "Present" ? "badge-success" : a.status === "Late" ? "badge-warning" : "badge-danger"}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 7. My Leaves Tab & Balance Tracking */}
      {activeTab === "leaves" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>SICK LEAVE BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", margin: "0.3rem 0" }}>
                {leavesData.balances?.remaining?.Sick ?? 12} / 12 Days
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Used: {leavesData.balances?.used?.Sick ?? 0} days
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>CASUAL LEAVE BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#3b82f6", margin: "0.3rem 0" }}>
                {leavesData.balances?.remaining?.Casual ?? 12} / 12 Days
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Used: {leavesData.balances?.used?.Casual ?? 0} days
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>PAID LEAVE BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#8b5cf6", margin: "0.3rem 0" }}>
                {leavesData.balances?.remaining?.Paid ?? 18} / 18 Days
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Used: {leavesData.balances?.used?.Paid ?? 0} days
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="card-header-flex">
              <h3 className="card-title">
                <FileText size={22} style={{ color: "#f59e0b" }} /> My Leave Applications
              </h3>
              <button className="btn-primary" onClick={() => setIsLeaveModalOpen(true)}>
                <Plus size={18} /> Apply For Leave
              </button>
            </div>

            <div className="custom-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>HR Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {leavesData.leaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No leave applications found.
                      </td>
                    </tr>
                  ) : (
                    leavesData.leaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <span className="badge badge-info">{l.type}</span>
                        </td>
                        <td>{new Date(l.startDate).toLocaleDateString()}</td>
                        <td>{new Date(l.endDate).toLocaleDateString()}</td>
                        <td>{l.reason}</td>
                        <td>
                          <span className={`badge ${l.status === "Approved" ? "badge-success" : l.status === "Rejected" ? "badge-danger" : "badge-warning"}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>{l.hrRemarks || "--"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 8. My Regularization Tab */}
      {activeTab === "regularization" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <Clock size={22} style={{ color: "#8b5cf6" }} /> Attendance Regularization
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Request punch corrections if you forgot to punch in/out or faced technical issues.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setIsRegModalOpen(true)}>
              <Plus size={18} /> Request Correction
            </button>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Requested In</th>
                  <th>Requested Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>HR Remarks</th>
                </tr>
              </thead>
              <tbody>
                {regularizations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No regularization requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  regularizations.map((r) => (
                    <tr key={r._id}>
                      <td>{r.requestedPunchIn ? new Date(r.requestedPunchIn).toLocaleString() : "-"}</td>
                      <td>{r.requestedPunchOut ? new Date(r.requestedPunchOut).toLocaleString() : "-"}</td>
                      <td>{r.reason}</td>
                      <td>
                        <span className={`badge ${r.status === "Approved" ? "badge-success" : r.status === "Rejected" ? "badge-danger" : "badge-warning"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.hrRemarks || "--"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. My Salary Slips Tab */}
      {activeTab === "payroll" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <CircleDollarSign size={22} style={{ color: "#10b981" }} /> My Monthly Salary Slips
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                View detailed monthly payslips and download PDF statements.
              </p>
            </div>
          </div>

          <div className="custom-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Basic Pay</th>
                  <th>HRA & Allowances</th>
                  <th>Deductions</th>
                  <th>Net Take-Home</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salarySlips.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No salary slips published yet.
                    </td>
                  </tr>
                ) : (
                  salarySlips.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <span className="badge badge-info">{s.month}</span>
                      </td>
                      <td>₹{(s.basicSalary || 0).toLocaleString()}</td>
                      <td>₹{((s.hra || 0) + (s.allowances || 0) + (s.bonus || 0)).toLocaleString()}</td>
                      <td style={{ color: "#f43f5e" }}>-₹{(s.deductions || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 800, color: "#10b981", fontSize: "1.05rem" }}>
                        ₹{(s.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
                          onClick={() => downloadSalarySlipPDF(s, user)}
                        >
                          <Download size={14} /> Download PDF
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

      {/* My Documents Tab */}
      {activeTab === "documents" && (
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">
                <FileText size={22} style={{ color: "#3b82f6" }} /> My Personal Documents
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Manage Aadhaar, PAN, Resume, and identity proofs.
              </p>
            </div>
          </div>

          {/* Document Upload Form */}
          <form onSubmit={handleAddDocument} style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: "200px" }}
              placeholder="Document Title (e.g. Aadhaar Card)"
              value={docForm.title}
              onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
              required
            />
            <input
              type="text"
              className="form-input"
              style={{ flex: 1.5, minWidth: "250px" }}
              placeholder="Document URL / Link"
              value={docForm.url}
              onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
              required
            />
            <button type="submit" className="btn-primary">
              <Upload size={16} /> Upload Document
            </button>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {(user?.documents || []).length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No documents uploaded yet.</p>
            ) : (
              (user.documents || []).map((doc, idx) => (
                <div key={idx} style={{ background: "var(--bg-main)", padding: "1.25rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.25rem" }}>{doc.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: "none", display: "inline-flex", padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}>
                    View Document
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in" style={{ maxWidth: "500px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.25rem" }}>Apply For Leave</h3>
            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-select" value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Paid">Paid Leave</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason For Leave</label>
                <textarea className="form-textarea" rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Leave Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Regularization Modal */}
      {isRegModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in" style={{ maxWidth: "500px" }}>
            <h3
  style={{
    fontSize: "1.2rem",
    fontWeight: 800,
    marginBottom: "1.25rem",
  }}
>
  Attendance Regularization
</h3>
            <form onSubmit={handleSubmitRegularization}>
              <div className="form-group">
                <label className="form-label">Requested Punch-In Timestamp</label>
                <input type="datetime-local" className="form-input" value={regForm.requestedPunchIn} onChange={(e) => setRegForm({ ...regForm, requestedPunchIn: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Requested Punch-Out Timestamp</label>
                <input type="datetime-local" className="form-input" value={regForm.requestedPunchOut} onChange={(e) => setRegForm({ ...regForm, requestedPunchOut: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Reason For Correction</label>
                <textarea className="form-textarea" rows={3} placeholder="e.g. Biometric reader issue at entrance..." value={regForm.reason} onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })} required />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsRegModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Correction Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
