import axios from "axios";

const API_URL =
  "http://localhost:5000/api/attendance";

const getToken = () => {
  return localStorage.getItem("token");
};

export const getAttendance =
  async () => {
    const response = await axios.get(
      API_URL,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  };

export const markAttendance =
  async (attendanceData) => {
    const response = await axios.post(
      API_URL,
      attendanceData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  };

export const deleteAttendance =
  async (id) => {
    const response = await axios.delete(
      `${API_URL}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  };