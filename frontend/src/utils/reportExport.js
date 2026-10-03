import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Export Array of objects to Excel File (.xlsx)
export const exportToExcel = (data, fileName = "Report") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
};

// Export Table Data to PDF Document
export const exportToPDF = (title, headers, rows, fileName = "Report") => {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("FactoHR Enterprise System", 14, 20);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 28);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Download Beautiful Salary Slip PDF
export const downloadSalarySlipPDF = (slip, user) => {
  const doc = new jsPDF();

  // Company Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 35, "F");

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("FactoHR Solutions Ltd.", 14, 18);

  doc.setFontSize(11);
  doc.text("MONTHLY SALARY PAYSLIP", 14, 27);
  doc.text(`Pay Month: ${slip.month}`, 150, 27);

  // Employee Information Box
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 45, 182, 35);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  doc.text(`Employee Name: ${user.name || slip.employeeName}`, 18, 54);
  doc.text(`Employee ID: ${user.employeeId || slip.employeeId}`, 18, 62);
  doc.text(`Department: ${user.department || "Engineering"}`, 18, 70);

  doc.text(`Designation: ${user.designation || "Staff"}`, 110, 54);
  doc.text(`PAN: ${user.panNumber || "N/A"}`, 110, 62);
  doc.text(`Status: PAID`, 110, 70);

  // Earnings & Deductions Breakdown Table
  const headers = ["Earnings", "Amount (₹)", "Deductions", "Amount (₹)"];
  const rows = [
    ["Basic Salary", `₹${slip.basicSalary.toLocaleString()}`, "Tax / PF", `₹${slip.tax.toLocaleString()}`],
    ["House Rent Allowance (HRA)", `₹${slip.hra.toLocaleString()}`, "Other Deductions", `₹${(slip.deductions - slip.tax).toLocaleString()}`],
    ["Special Allowances", `₹${slip.allowances.toLocaleString()}`, "-", "-"],
    ["Performance Bonus", `₹${slip.bonus.toLocaleString()}`, "-", "-"],
  ];

  autoTable(doc, {
    startY: 88,
    head: [headers],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
  });

  // Net Salary Summary Banner
  const finalY = doc.lastAutoTable.finalY + 12;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY, 182, 20, "F");

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("NET SALARY PAYABLE:", 20, finalY + 13);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`₹${slip.netSalary.toLocaleString()}`, 145, finalY + 13);

  // Footer Note
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("This is a computer-generated salary slip and does not require a physical signature.", 14, 280);

  doc.save(`Payslip_${user.name?.replace(/\s+/g, "_")}_${slip.month}.pdf`);
};
