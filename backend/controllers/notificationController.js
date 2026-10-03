import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Get user or admin notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const isUserAdmin = req.user.role === "Admin";

    let query;
    if (isUserAdmin) {
      query = { $or: [{ recipient: "ADMIN" }, { recipient: "ALL" }, { recipient: req.user._id.toString() }] };
    } else {
      query = { $or: [{ recipient: "ALL" }, { recipient: req.user._id.toString() }] };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    return res.json({ message: "Marked as read", notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Birthday Notifications specifically
// @route   GET /api/notifications/birthdays
// @access  Private (Admin / Employee)
export const getBirthdayNotifications = async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" }).select("name email dob department designation profilePic");
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowMonthDay = `${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const todayMonthDay = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const birthdaysTomorrow = [];
    const birthdaysToday = [];

    employees.forEach((emp) => {
      if (!emp.dob) return;
      const parts = emp.dob.split("-");
      if (parts.length < 3) return;
      const empMonthDay = `${parts[1]}-${parts[2]}`;

      if (empMonthDay === tomorrowMonthDay) {
        birthdaysTomorrow.push(emp);
      } else if (empMonthDay === todayMonthDay) {
        birthdaysToday.push(emp);
      }
    });

    return res.json({
      success: true,
      birthdaysTomorrow,
      birthdaysToday,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
