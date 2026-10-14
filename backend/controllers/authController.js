import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

// @desc    Auth user & get token cookie
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateTokenAndSetCookie(res, user);

      const userObj = user.toObject();
      delete userObj.password;

      return res.json({
        success: true,
        token,
        user: userObj,
        ...userObj,
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
  });
  return res.json({ success: true, message: "Logged out successfully" });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile (Self Service)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fieldsToUpdate = [
      "phone",
      "address",
      "emergencyContact",
      "profilePic",
      "dob",
      "gender",
      "bloodGroup",
      "aadhaarNumber",
      "panNumber",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.documents) {
      user.documents = req.body.documents;
    }

    await user.save();

    // Also update Employee doc if exists
    await Employee.findOneAndUpdate(
      { email: user.email },
      {
        phone: user.phone,
        address: user.address,
        emergencyContact: user.emergencyContact,
        profilePic: user.profilePic,
        documents: user.documents,
      }
    );

    const updated = await User.findById(user._id).select("-password");
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};