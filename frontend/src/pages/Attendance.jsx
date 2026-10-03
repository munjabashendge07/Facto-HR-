import {
  useEffect,
  useState,
} from "react";

import {
  getAttendance,
} from "../services/attendanceService";

function Attendance() {
  const [attendance, setAttendance] =
    useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance =
    async () => {
      try {
        const data =
          await getAttendance();

        setAttendance(
          data.attendance || []
        );
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div>
      <h1>
        Attendance Management
      </h1>

      <table border="1">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((item) => (
            <tr key={item._id}>
              <td>
                {item.employee?.name}
              </td>

              <td>
                {new Date(
                  item.date
                ).toLocaleDateString()}
              </td>

              <td>
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Attendance;