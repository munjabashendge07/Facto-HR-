function Dashboard({ employees = [] }) {
  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (sum, employee) => sum + (employee.salary || 0),
    0
  );

  const itEmployees = employees.filter(
    (employee) => employee.department === "IT"
  ).length;

  const hrEmployees = employees.filter(
    (employee) => employee.department === "HR"
  ).length;

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Employees</h3>
          <p>{totalEmployees}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Salary</h3>
          <p>₹{totalSalary.toLocaleString("en-IN")}</p>
        </div>

        <div className="dashboard-card">
          <h3>IT Employees</h3>
          <p>{itEmployees}</p>
        </div>

        <div className="dashboard-card">
          <h3>HR Employees</h3>
          <p>{hrEmployees}</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;