import User from "../models/User.js";
import Employee from "../models/Employee.js";

// Helper to generate employee ID like EMP001, EMP002 if not provided
const generateEmpId = async () => {
  const count = await User.countDocuments();
  return `EMP${String(count + 1).padStart(3, "0")}`;
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private (Admin)
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/admin/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new employee
// @route   POST /api/admin/employees
// @access  Private (Admin)
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      salary,
      phone,
      dob,
      gender,
      address,
      emergencyContact,
      joiningDate,
      bloodGroup,
      aadhaarNumber,
      panNumber,
      profilePic,
      officeLocation,
      geofenceRadiusMeters,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const empId = req.body.employeeId || (await generateEmpId());

    const user = new User({
      name,
      employeeId: empId,
      email: email.toLowerCase(),
      password: password || "Facto@123", // Default password if not provided
      role: role || "Employee",
      department: department || "Engineering",
      designation: designation || "Software Engineer",
      salary: salary ? Number(salary) : 50000,
      phone: phone || "",
      dob: dob || "1998-05-15",
      gender: gender || "Male",
      address: address || "123 Tech Park, Innovation Way",
      emergencyContact: emergencyContact || { name: "", relationship: "", phone: "" },
      joiningDate: joiningDate || new Date().toISOString().split("T")[0],
      bloodGroup: bloodGroup || "O+",
      aadhaarNumber: aadhaarNumber || "",
      panNumber: panNumber || "",
      profilePic: profilePic || "",
      officeLocation: officeLocation || { lat: 18.5204, lng: 73.8567 },
      geofenceRadiusMeters: geofenceRadiusMeters || 100,
    });

    await user.save();

    // Create linked Employee document
    const employeeDoc = new Employee({
      employeeId: empId,
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      salary: user.salary,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      emergencyContact: user.emergencyContact,
      joiningDate: user.joiningDate,
      bloodGroup: user.bloodGroup,
      aadhaarNumber: user.aadhaarNumber,
      panNumber: user.panNumber,
      profilePic: user.profilePic,
    });
    await employeeDoc.save();

    const createdUser = await User.findById(user._id).select("-password");
    return res.status(201).json(createdUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/admin/employees/:id
// @access  Private (Admin)
export const updateEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const updatableFields = [
      "name",
      "email",
      "role",
      "department",
      "designation",
      "salary",
      "phone",
      "dob",
      "gender",
      "address",
      "emergencyContact",
      "joiningDate",
      "bloodGroup",
      "aadhaarNumber",
      "panNumber",
      "profilePic",
      "officeLocation",
      "geofenceRadiusMeters",
      "employeeId",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "email") {
          user.email = req.body.email.toLowerCase();
        } else if (field === "salary") {
          user.salary = Number(req.body.salary);
        } else {
          user[field] = req.body[field];
        }
      }
    });

    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password;
    }

    await user.save();

    // Sync Employee doc
    await Employee.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        employeeId: user.employeeId,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        salary: user.salary,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        emergencyContact: user.emergencyContact,
        joiningDate: user.joiningDate,
        bloodGroup: user.bloodGroup,
        aadhaarNumber: user.aadhaarNumber,
        panNumber: user.panNumber,
        profilePic: user.profilePic,
      },
      { upsert: true }
    );

    const updatedUser = await User.findById(user._id).select("-password");
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private (Admin)
export const deleteEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employee.deleteOne({ email: user.email });
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};