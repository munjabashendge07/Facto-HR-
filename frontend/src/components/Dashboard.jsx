import React from "react";

const Dashboard = ({ employees }) => {
  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (sum, emp) => sum + Number(emp.salary),
    0
  );

  const itEmployees = employees.filter(
    (emp) => emp.department === "IT"
  ).length;

  const hrEmployees = employees.filter(
    (emp) => emp.department === "HR"
  ).length;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="dashboard-cards">

        <div className="card">
          <h3>Total Employees</h3>
          <p>{totalEmployees}</p>
        </div>

        <div className="card">
          <h3>Total Salary</h3>
          <p>₹{totalSalary}</p>
        </div>

        <div className="card">
          <h3>IT Employees</h3>
          <p>{itEmployees}</p>
        </div>

        <div className="card">
          <h3>HR Employees</h3>
          <p>{hrEmployees}</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;