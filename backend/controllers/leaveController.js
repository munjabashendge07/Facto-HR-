import Leave from "../models/Leave.js";
import Notification from "../models/Notification.js";

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee / Admin)
export const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields (type, startDate, endDate, reason) are required." });
    }

    const leave = new Leave({
      userId: req.user._id,
      type,
      startDate,
      endDate,
      reason,
      status: "Pending",
    });

    await leave.save();

    // Create Admin notification for Leave Request
    await Notification.create({
      recipient: "ADMIN",
      title: "New Leave Application",
      message: `${req.user.name} applied for ${type} leave (${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()})`,
      type: "LEAVE",
      meta: {
        employeeName: req.user.name,
        link: "/admin/leaves",
      },
    });

    return res.status(201).json(leave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's leave requests & balances
// @route   GET /api/leaves/my-leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Annual Quota default
    const quota = { Sick: 12, Casual: 12, Paid: 18 };
    const used = { Sick: 0, Casual: 0, Paid: 0 };

    leaves.forEach((l) => {
      if (l.status === "Approved") {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (used[l.type] !== undefined) {
          used[l.type] += Math.max(1, diffDays);
        }
      }
    });

    const balance = {
      Sick: Math.max(0, quota.Sick - used.Sick),
      Casual: Math.max(0, quota.Casual - used.Casual),
      Paid: Math.max(0, quota.Paid - used.Paid),
    };

    return res.json({
      leaves,
      balances: {
        quota,
        used,
        remaining: balance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leave requests (for Admin)
// @route   GET /api/leaves/all
// @access  Private (Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("userId", "name email department role profilePic")
      .sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, hrRemarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    if (hrRemarks !== undefined) {
      leave.hrRemarks = hrRemarks;
    }

    await leave.save();
    const updatedLeave = await Leave.findById(leave._id).populate("userId", "name email department");

    // Create Notification for Employee
    await Notification.create({
      recipient: leave.userId.toString(),
      title: `Leave ${status}`,
      message: `Your ${leave.type} leave request has been ${status.toLowerCase()}${hrRemarks ? `: ${hrRemarks}` : ""}.`,
      type: "LEAVE",
    });

    return res.json(updatedLeave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};