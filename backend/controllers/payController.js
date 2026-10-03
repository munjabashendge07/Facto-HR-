import Payroll from "../models/Payroll.js";
import User from "../models/User.js";

// @desc    Generate monthly payroll for all employees or single employee
// @route   POST /api/payroll/generate
// @access  Private (Admin)
export const generatePayroll = async (req, res) => {
  try {
    const { month, bonus = 0, deductions = 0 } = req.body; // format 'YYYY-MM'
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const employees = await User.find({ role: "Employee" });
    if (employees.length === 0) {
      return res.status(400).json({ message: "No active employees found to generate payroll." });
    }

    const generatedRecords = [];

    for (const emp of employees) {
      const baseSalary = emp.salary || 50000;
      const basicSalary = Math.round(baseSalary * 0.5);
      const hra = Math.round(baseSalary * 0.2);
      const allowances = Math.round(baseSalary * 0.2);
      const taxDeduction = Math.round(baseSalary * 0.1) + Number(deductions);
      const totalBonus = Number(bonus);
      const netSalary = basicSalary + hra + allowances + totalBonus - taxDeduction;

      // Upsert payroll record for month
      const record = await Payroll.findOneAndUpdate(
        { userId: emp._id, month: targetMonth },
        {
          userId: emp._id,
          employeeId: emp.employeeId || emp._id.toString(),
          employeeName: emp.name,
          month: targetMonth,
          basicSalary,
          hra,
          allowances,
          bonus: totalBonus,
          deductions: taxDeduction,
          tax: Math.round(baseSalary * 0.05),
          netSalary,
          status: "Paid",
          paidDate: new Date(),
        },
        { upsert: true, new: true }
      );

      generatedRecords.push(record);
    }

    return res.status(200).json({
      success: true,
      message: `Payroll successfully generated for ${targetMonth}`,
      count: generatedRecords.length,
      payroll: generatedRecords,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payroll records (Admin)
// @route   GET /api/payroll/all
// @access  Private (Admin)
export const getAllPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("userId", "name email employeeId department designation profilePic")
      .sort({ month: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      payroll: payrolls,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current employee's salary slips
// @route   GET /api/payroll/my-slips
// @access  Private
export const getMySalarySlips = async (req, res) => {
  try {
    const slips = await Payroll.find({ userId: req.user._id }).sort({ month: -1 });

    return res.status(200).json({
      success: true,
      slips,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};