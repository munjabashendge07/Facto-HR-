import React, { useState, useEffect } from "react";
import { X, Save, UserCheck, Shield, Upload, FileText } from "lucide-react";

const EmployeeModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
    role: "Employee",
    phone: "",
    department: "Engineering",
    designation: "Software Engineer",
    salary: 50000,
    dob: "1998-05-15",
    gender: "Male",
    address: "123 Tech Park, Innovation Way",
    emergencyContact: { name: "", relationship: "", phone: "" },
    joiningDate: new Date().toISOString().split("T")[0],
    bloodGroup: "O+",
    aadhaarNumber: "",
    panNumber: "",
    profilePic: "",
  });

  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "", // Leave blank unless updating
        emergencyContact: initialData.emergencyContact || { name: "", relationship: "", phone: "" },
      });
    } else {
      setFormData({
        name: "",
        employeeId: "",
        email: "",
        password: "",
        role: "Employee",
        phone: "",
        department: "Engineering",
        designation: "Software Engineer",
        salary: 50000,
        dob: "1998-05-15",
        gender: "Male",
        address: "",
        emergencyContact: { name: "", relationship: "", phone: "" },
        joiningDate: new Date().toISOString().split("T")[0],
        bloodGroup: "O+",
        aadhaarNumber: "",
        panNumber: "",
        profilePic: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card fade-in" style={{ maxWidth: "750px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {initialData ? "Edit Employee Profile" : "Add New Employee"}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Enterprise HR Record Management
            </p>
          </div>
          <button className="theme-toggle-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Tab Headers */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
          {["personal", "job", "identity"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn-secondary ${activeTab === tab ? "btn-primary" : ""}`}
              style={{ textTransform: "capitalize", borderRadius: "8px 8px 0 0", padding: "0.5rem 1rem" }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "personal" ? "Personal Info" : tab === "job" ? "Job & Payroll" : "Identity & Contact"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "personal" && (
            <div className="fade-in">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth (DOB) *</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-input"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="bloodGroup" className="form-select" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Profile Photo URL</label>
                <input
                  type="text"
                  name="profilePic"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.profilePic}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <textarea
                  name="address"
                  className="form-textarea"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {activeTab === "job" && (
            <div className="fade-in">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    className="form-input"
                    placeholder="EMP001 (Auto-generated if blank)"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">User Role</label>
                  <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                    <option value="Engineering">Engineering</option>
                    <option value="HR & Management">HR & Management</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-input"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    name="salary"
                    className="form-input"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Joining</label>
                  <input
                    type="date"
                    name="joiningDate"
                    className="form-input"
                    value={formData.joiningDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder={initialData ? "Leave blank to keep unchanged" : "Set initial password"}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {activeTab === "identity" && (
            <div className="fade-in">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    className="form-input"
                    placeholder="1234-5678-9012"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Card Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    className="form-input"
                    placeholder="ABCDE1234F"
                    value={formData.panNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "1rem 0 0.5rem" }}>
                Emergency Contact Details
              </h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.emergencyContact.name}
                    onChange={handleEmergencyChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    name="relationship"
                    className="form-input"
                    placeholder="Father / Spouse / Sister"
                    value={formData.emergencyContact.relationship}
                    onChange={handleEmergencyChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.emergencyContact.phone}
                  onChange={handleEmergencyChange}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>{initialData ? "Update Employee" : "Create Employee"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
