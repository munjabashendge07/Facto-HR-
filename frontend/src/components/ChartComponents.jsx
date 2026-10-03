import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const AttendanceChart = ({ data = [] }) => {
  const labels = data.map((d) => d.day || d.date);

  const chartData = {
    labels: labels.length ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Present",
        data: data.length ? data.map((d) => d.present) : [12, 14, 15, 13, 14, 8, 4],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 6,
      },
      {
        label: "Late",
        data: data.length ? data.map((d) => d.late) : [2, 1, 3, 2, 1, 0, 0],
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderRadius: 6,
      },
      {
        label: "Absent",
        data: data.length ? data.map((d) => d.absent) : [1, 0, 1, 2, 0, 7, 11],
        backgroundColor: "rgba(244, 63, 94, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(150, 150, 150, 0.1)" } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const DepartmentChart = ({ data = [] }) => {
  const labels = data.length ? data.map((d) => d._id || "Dept") : ["Engineering", "Marketing", "Finance", "Sales", "HR"];
  const counts = data.length ? data.map((d) => d.count) : [8, 4, 3, 5, 2];

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#10b981",
          "#f59e0b",
          "#06b6d4",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
    },
    cutout: "65%",
  };

  return <Doughnut data={chartData} options={options} />;
};

export const LeaveStatsChart = ({ stats = {} }) => {
  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [stats.Approved || 12, stats.Pending || 3, stats.Rejected || 2],
        backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    cutout: "60%",
  };

  return <Doughnut data={chartData} options={options} />;
};

export const PayrollTrendsChart = ({ totalPayroll = 0 }) => {
  const chartData = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      {
        label: "Monthly Payroll Expenditure (₹)",
        data: [
          totalPayroll ? totalPayroll * 0.9 : 240000,
          totalPayroll ? totalPayroll * 0.95 : 255000,
          totalPayroll ? totalPayroll * 0.98 : 260000,
          totalPayroll || 275000,
          totalPayroll ? totalPayroll * 1.02 : 280000,
          totalPayroll ? totalPayroll * 1.05 : 290000,
        ],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
