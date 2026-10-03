import { useState } from "react";
import { createEmployee } from "../services/employeeService";

function AddEmployee({ onEmployeeAdded, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await createEmployee({
        ...formData,
        salary: Number(formData.salary),
      });

      if (response.data.success) {
        onEmployeeAdded();
        onClose();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create employee"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="employee-modal">

        <div className="modal-header">
          <div>
            <h2>Add Employee</h2>
            <p>Enter employee information</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                name="employeeId"
                placeholder="EMP002"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="rahul@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="React Developer"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                placeholder="50000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Employee"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddEmployee;