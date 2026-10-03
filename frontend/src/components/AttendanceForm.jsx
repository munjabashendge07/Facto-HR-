import { useState } from "react";

import {
  markAttendance,
} from "../services/attendanceService";

function AttendanceForm({
  employeeId,
  onSuccess,
}) {
  const [status, setStatus] =
    useState("Present");

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      await markAttendance({
        employee: employeeId,
        status,
      });

      onSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={status}
        onChange={(e) =>
          setStatus(
            e.target.value
          )
        }
      >
        <option value="Present">
          Present
        </option>

        <option value="Absent">
          Absent
        </option>

        <option value="Half Day">
          Half Day
        </option>
      </select>

      <button type="submit">
        Mark Attendance
      </button>
    </form>
  );
}

export default AttendanceForm;