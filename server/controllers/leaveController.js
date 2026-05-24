const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get leave requests (Admin sees all, Employee sees their own)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      if (!req.user.employeeProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.employee = req.user.employeeProfile;
    }

    const leaves = await Leave.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .populate('employee', 'fullName employeeId department designation')
      .populate('approvedBy', 'name');

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    console.error('GetLeaves Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply for a new leave request
// @route   POST /api/leaves
// @access  Private (Employee only)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields' });
    }

    if (req.user.role !== 'employee' || !req.user.employeeProfile) {
      return res.status(400).json({ success: false, message: 'Only active employees can submit leave applications' });
    }

    const leave = await Leave.create({
      employee: req.user.employeeProfile,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
    });

    const populatedLeave = await Leave.findById(leave._id).populate(
      'employee',
      'fullName employeeId department'
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave,
    });
  } catch (error) {
    console.error('ApplyLeave Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status as Approved or Rejected' });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Leave request has already been processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'fullName employeeId department')
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Leave application status updated to ${status}`,
      data: populatedLeave,
    });
  } catch (error) {
    console.error('UpdateLeaveStatus Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
};
