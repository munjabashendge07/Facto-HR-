import { useState } from "react";
import { applyLeave } from "../services/leaveService";

function Leave() {
  const [form, setForm] = useState({
    employee: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await applyLeave(form);

      alert("Leave Applied");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Apply Leave</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="employee"
          placeholder="Employee ID"
          className="form-control mb-2"
          onChange={handleChange}
        />

        <input
          type="text"
          name="leaveType"
          placeholder="Leave Type"
          className="form-control mb-2"
          onChange={handleChange}
        />

        <input
          type="date"
          name="fromDate"
          className="form-control mb-2"
          onChange={handleChange}
        />

        <input
          type="date"
          name="toDate"
          className="form-control mb-2"
          onChange={handleChange}
        />

        <textarea
          name="reason"
          placeholder="Reason"
          className="form-control mb-2"
          onChange={handleChange}
        />

        <button className="btn btn-primary">
          Apply Leave
        </button>
      </form>
    </div>
  );
}

export default Leave;