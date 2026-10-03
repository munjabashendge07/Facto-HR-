
import axios from "axios";

const API_URL = "http://localhost:5000/api/leaves";

export const applyLeave = async (leaveData) => {
  const response = await axios.post(
    API_URL,
    leaveData
  );

  return response.data;
};

export const getLeaves = async () => {
  const response = await axios.get(API_URL);

  return response.data;
};

export const updateLeaveStatus = async (
  id,
  status
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    { status }
  );

  return response.data;
};