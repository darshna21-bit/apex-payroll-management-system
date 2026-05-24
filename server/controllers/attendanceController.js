const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get attendance logs (Admin sees all, Employee sees their own)
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      if (!req.user.employeeProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.employee = req.user.employeeProfile;
    } else {
      // Admin filter by specific employee Mongoose ID or date
      const { employeeId, date } = req.query;
      if (employeeId) query.employee = employeeId;
      if (date) query.date = date;
    }

    const logs = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .populate('employee', 'fullName employeeId department designation');

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('GetAttendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record/Update daily attendance check-in
// @route   POST /api/attendance
// @access  Private
const logAttendance = async (req, res) => {
  try {
    const { status, date, employeeId } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please specify attendance status' });
    }

    // Determine target employee
    let targetEmployeeId;
    if (req.user.role === 'employee') {
      if (!req.user.employeeProfile) {
        return res.status(400).json({ success: false, message: 'Employee profile is not configured for this user' });
      }
      targetEmployeeId = req.user.employeeProfile;
    } else {
      // Admin logging on behalf of employee
      if (!employeeId) {
        return res.status(400).json({ success: false, message: 'Please provide employeeId' });
      }
      targetEmployeeId = employeeId;
    }

    // Set today's date formatted to YYYY-MM-DD if none provided
    const targetDate = date || new Date().toISOString().substring(0, 10);
    const todayDate = new Date().toISOString().substring(0, 10);

    // Backend Validation: Block future attendance dates
    if (targetDate > todayDate) {
      return res.status(400).json({
        success: false,
        message: 'Future attendance dates are not allowed',
      });
    }

    // Backend Validation: Block duplicate entries for same employee and same date
    const existingAttendance = await Attendance.findOne({
      employee: targetEmployeeId,
      date: targetDate,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this employee on this date',
      });
    }

    // Create new attendance record
    const log = await Attendance.create({
      employee: targetEmployeeId,
      date: targetDate,
      status,
    });

    const populatedLog = await Attendance.findById(log._id).populate(
      'employee',
      'fullName employeeId department'
    );

    res.status(200).json({
      success: true,
      message: `Attendance logged successfully as ${status}`,
      data: populatedLog,
    });
  } catch (error) {
    console.error('LogAttendance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendance,
  logAttendance,
};
