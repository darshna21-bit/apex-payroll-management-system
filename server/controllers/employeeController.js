const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees (with search and filter)
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = {};

    // Apply Search (Fuzzy search by name or ID)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply Filters
    if (department) {
      query.department = department;
    }
    if (status) {
      query.status = status;
    }

    const employees = await Employee.find(query).sort({ employeeId: 1 }).populate('user', 'email role');
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    console.error('GetEmployees Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private (Admin or Owner Employee)
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'email role');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check permissions (Admin or the Owner employee)
    if (
      req.user.role !== 'admin' &&
      req.user.employeeProfile &&
      req.user.employeeProfile.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('GetEmployeeById Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new employee (and their User account)
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (asyncReq, asyncRes) => {
  // Use custom variables to prevent naming clashes in outer scopes
  try {
    const {
      fullName,
      email,
      phone,
      employeeId,
      department,
      designation,
      joiningDate,
      status,
      salaryStructure,
    } = asyncReq.body;

    if (!fullName || !email || !phone || !employeeId || !department || !designation || !joiningDate || !salaryStructure) {
      return asyncRes.status(400).json({ success: false, message: 'All required employee fields must be completed' });
    }

    // Check if email or employeeId already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return asyncRes.status(400).json({ success: false, message: 'User account with this email already exists' });
    }

    const empIdExists = await Employee.findOne({ employeeId });
    if (empIdExists) {
      return asyncRes.status(400).json({ success: false, message: 'Employee ID is already assigned' });
    }

    // Create the User Account with a default password (e.g. employeeId + 123)
    const defaultPassword = `${employeeId}123`;
    const user = await User.create({
      name: fullName,
      email,
      password: defaultPassword,
      role: 'employee',
    });

    // Create Employee record referencing User
    const employee = await Employee.create({
      user: user._id,
      fullName,
      email,
      phone,
      employeeId,
      department,
      designation,
      joiningDate,
      status: status || 'active',
      salaryStructure,
    });

    // Update User back with the employeeProfile reference
    user.employeeProfile = employee._id;
    await user.save();

    asyncRes.status(201).json({
      success: true,
      message: 'Employee and login user account created successfully',
      data: employee,
      credentials: {
        email: user.email,
        password: defaultPassword,
      },
    });
  } catch (error) {
    console.error('CreateEmployee Error:', error);
    asyncRes.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      department,
      designation,
      joiningDate,
      status,
      salaryStructure,
    } = req.body;

    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update Employee document
    employee.fullName = fullName || employee.fullName;
    employee.phone = phone || employee.phone;
    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.joiningDate = joiningDate || employee.joiningDate;
    employee.status = status || employee.status;
    
    if (salaryStructure) {
      employee.salaryStructure = {
        ...employee.salaryStructure.toObject(),
        ...salaryStructure,
      };
    }

    await employee.save();

    // Also update associated user name if changed
    if (fullName) {
      await User.findByIdAndUpdate(employee.user, { name: fullName });
    }

    res.status(200).json({ success: true, message: 'Employee profile updated successfully', data: employee });
  } catch (error) {
    console.error('UpdateEmployee Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee (Deletes both Employee & User documents)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete associated User
    await User.findByIdAndDelete(employee.user);

    // Delete Employee
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Employee and user login deleted successfully' });
  } catch (error) {
    console.error('DeleteEmployee Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
