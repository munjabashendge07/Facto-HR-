import axios from "axios";

const API_URL = "http://localhost:5000/api/employees";

// Get all employees
export const getEmployees = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Create employee
export const createEmployee = async (employeeData) => {
  const response = await axios.post(API_URL, employeeData);
  return response.data;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    employeeData
  );
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};