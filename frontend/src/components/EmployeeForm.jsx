
import { useState, useEffect } from "react";
import {
  createEmployee,
  updateEmployee,
} from "../services/employeeService";

function EmployeeForm({
  employee,
  isEditing,
  onEmployeeAdded,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || "",
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
        salary: employee.salary || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await updateEmployee(employee._id, formData);
      } else {
        await createEmployee(formData);
      }

      onEmployeeAdded();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save employee."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-container">
      <div className="employee-form">
        <div className="form-header">
          <div>
            <h2>
              {isEditing
                ? "Edit Employee"
                : "Add Employee"}
            </h2>

            <p>
              {isEditing
                ? "Update employee information."
                : "Enter employee information below."}
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP001"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="employee@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">
                  Select Department
                </option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">
                  Marketing
                </option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="45000"
                min="0"
              />
            </div>

          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Employee"
                : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;

