import Regularization from "../models/Regularization.js";
import Attendance from "../models/Attendance.js";

// @desc    Submit regularization request
// @route   POST /api/regularization
// @access  Private (Employee / Admin)
export const requestRegularization = async (req, res) => {
  try {
    const { attendanceId, requestedPunchIn, requestedPunchOut, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason for regularization is required." });
    }

    const reg = new Regularization({
      userId: req.user._id,
      attendanceId: attendanceId || null,
      requestedPunchIn: requestedPunchIn ? new Date(requestedPunchIn) : undefined,
      requestedPunchOut: requestedPunchOut ? new Date(requestedPunchOut) : undefined,
      reason,
      status: "Pending",
    });

    await reg.save();
    return res.status(201).json(reg);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's regularization requests
// @route   GET /api/regularization/my-requests
// @access  Private
export const getMyRegularizations = async (req, res) => {
  try {
    const list = await Regularization.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all regularization requests (Admin)
// @route   GET /api/regularization/all
// @access  Private (Admin)
export const getAllRegularizations = async (req, res) => {
  try {
    const list = await Regularization.find()
      .populate("userId", "name email department role")
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Approve / Reject regularization request
// @route   PUT /api/regularization/:id/status
// @access  Private (Admin)
export const updateRegularizationStatus = async (req, res) => {
  try {
    const { status, hrRemarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
    }

    const reg = await Regularization.findById(req.params.id);
    if (!reg) {
      return res.status(404).json({ message: "Regularization request not found" });
    }

    reg.status = status;
    if (hrRemarks !== undefined) {
      reg.hrRemarks = hrRemarks;
    }

    // If approved, update or create Attendance record
    if (status === "Approved") {
      let attendance;
      if (reg.attendanceId) {
        attendance = await Attendance.findById(reg.attendanceId);
      }

      if (!attendance) {
        const reqDateStr = (reg.requestedPunchIn || new Date()).toISOString().split("T")[0];
        attendance = new Attendance({
          userId: reg.userId,
          date: reqDateStr,
          status: "Present",
        });
      }

      if (reg.requestedPunchIn) {
        attendance.punchIn = {
          timestamp: reg.requestedPunchIn,
          lat: req.user.officeLocation?.lat ?? 18.5204,
          lng: req.user.officeLocation?.lng ?? 73.8567,
          distanceMeters: 0,
        };
      }

      if (reg.requestedPunchOut) {
        attendance.punchOut = {
          timestamp: reg.requestedPunchOut,
          lat: req.user.officeLocation?.lat ?? 18.5204,
          lng: req.user.officeLocation?.lng ?? 73.8567,
          distanceMeters: 0,
        };
      }

      attendance.status = "Present";
      await attendance.save();
    }

    await reg.save();
    const updatedReg = await Regularization.findById(reg._id).populate("userId", "name email department");
    return res.json(updatedReg);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
