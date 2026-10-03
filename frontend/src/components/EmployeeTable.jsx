function EmployeeTable({ employees }) {
  return (
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
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>{employee.department}</td>
                <td>{employee.designation}</td>
                <td>₹{employee.salary}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;