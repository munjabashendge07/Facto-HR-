import { useEffect, useState } from "react";
import {
  getEmployees,
  deleteEmployee,
} from "../services/employeeService";

import EmployeeForm from "../components/EmployeeForm";

function Employees() {
const [employees, setEmployees] = useState([]);
const [showForm, setShowForm] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data = await getEmployees();

      setEmployees(data.employees || []);
    } catch (error) {
      setError("Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeAdded = () => {
  setShowForm(false);
  setSelectedEmployee(null);
  setIsEditing(false);
  fetchEmployees();
};

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);

      fetchEmployees();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete employee."
      );
    }
  };

  return (
    <section className="employees-page">

      <div className="employees-header">
        <div>
          <h1>Employee Management</h1>
          <p>
            Manage and monitor your organization's employees.
          </p>
        </div>

        <button
          className="add-employee-btn"
          onClick={() => {
            setSelectedEmployee(null);
            setIsEditing(false);
            setShowForm(true);
          }}
        >
          + Add Employee
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading employees...
        </div>
      ) : (
        <div className="employee-table-container">
          <table className="employee-table">

            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id}>

                    <td>{employee.employeeId}</td>

                    <td>{employee.name}</td>

                    <td>{employee.email}</td>

                    <td>{employee.phone || "-"}</td>

                    <td>{employee.department || "-"}</td>

                    <td>{employee.designation || "-"}</td>

                    <td>
                      ₹{employee.salary?.toLocaleString("en-IN")}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEditing(true);
                          setShowForm(true);
                          }}
                        >
                          Edit
                        </button>


                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(employee._id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      )}

      {showForm && (
  <EmployeeForm
    employee={selectedEmployee}
    isEditing={isEditing}
    onEmployeeAdded={handleEmployeeAdded}
    onCancel={() => {
      setShowForm(false);
      setSelectedEmployee(null);
      setIsEditing(false);
    }}
  />
)}

    </section>
  );
}

export default Employees;