const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { calculateNetSalary } = require('../utils/payrollCalculator');

// @desc    Get all payroll records (Admin sees all, Employee sees their own)
// @route   GET /api/payroll
// @access  Private
const getPayrolls = async (req, res) => {
  try {
    let query = {};

    // If employee role, filter by their profile ID
    if (req.user.role === 'employee') {
      if (!req.user.employeeProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.employee = req.user.employeeProfile;
    } else {
      // Admin filter by employee Mongoose ID if provided
      const { employeeId, month } = req.query;
      if (employeeId) query.employee = employeeId;
      if (month) query.month = month;
    }

    const payrolls = await Payroll.find(query)
      .sort({ month: -1, createdAt: -1 })
      .populate('employee', 'fullName employeeId department designation salaryStructure');

    res.status(200).json({ success: true, count: payrolls.length, data: payrolls });
  } catch (error) {
    console.error('GetPayrolls Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payroll details by ID
// @route   GET /api/payroll/:id
// @access  Private
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'fullName email phone employeeId department designation joiningDate salaryStructure');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' &&
      req.user.employeeProfile &&
      req.user.employeeProfile.toString() !== payroll.employee._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payroll' });
    }

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    console.error('GetPayrollById Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate payroll for an employee for a specific month
// @route   POST /api/payroll/generate
// @access  Private/Admin
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, customBonus, customDeductions } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({ success: false, message: 'Please provide employee Mongoose ID and month (YYYY-MM)' });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if payroll already generated for this month
    const payrollExists = await Payroll.findOne({ employee: employeeId, month });
    if (payrollExists) {
      return res.status(400).json({ success: false, message: `Payroll already generated for this employee for ${month}` });
    }

    // Base salary details from employee structure
    const baseStructure = employee.salaryStructure;
    
    // Add custom adjustments if specified during execution
    const allowances = baseStructure.allowances || 0;
    const bonus = (baseStructure.bonus || 0) + (Number(customBonus) || 0);
    const pfDeduction = baseStructure.pfDeduction || 0;
    const taxDeduction = baseStructure.taxDeduction || 0;
    const otherDeductions = (baseStructure.otherDeductions || 0) + (Number(customDeductions) || 0);

    // Compute Net Salary using utility
    const calculated = calculateNetSalary({
      baseSalary: baseStructure.baseSalary,
      allowances,
      bonus,
      pfDeduction,
      taxDeduction,
      otherDeductions,
    });

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      baseSalary: calculated.baseSalary,
      allowances: calculated.allowances,
      bonus: calculated.bonus,
      pfDeduction: calculated.pfDeduction,
      taxDeduction: calculated.taxDeduction,
      otherDeductions: calculated.otherDeductions,
      netSalary: calculated.netSalary,
      status: 'Pending',
    });

    const populatedPayroll = await Payroll.findById(payroll._id).populate(
      'employee',
      'fullName employeeId department designation'
    );

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: populatedPayroll,
    });
  } catch (error) {
    console.error('GeneratePayroll Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process salary / Pay payroll
// @route   PUT /api/payroll/:id/pay
// @access  Private/Admin
const payPayroll = async (req, res) => {
  try {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (payroll.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Payroll is already marked as paid' });
    }

    payroll.status = 'Paid';
    payroll.paymentDate = new Date();

    await payroll.save();

    res.status(200).json({ success: true, message: 'Payroll salary processed and paid successfully', data: payroll });
  } catch (error) {
    console.error('PayPayroll Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/payroll/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().substring(0, 7); // Format: "YYYY-MM"

    if (req.user.role === 'admin') {
      // --- ADMIN STATS ---
      const totalEmployees = await Employee.countDocuments({ status: 'active' });

      // Calculate Total Payroll processed this month
      const currentMonthPayrolls = await Payroll.find({ month: currentMonth });
      
      let totalPayrollThisMonth = 0;
      let pendingPayrollAmount = 0;
      let pendingPayrollCount = 0;

      currentMonthPayrolls.forEach((p) => {
        if (p.status === 'Paid') {
          totalPayrollThisMonth += p.netSalary;
        } else {
          pendingPayrollAmount += p.netSalary;
          pendingPayrollCount++;
        }
      });

      // Simple active leaves this month
      const pendingLeavesCount = await Leave.countDocuments({ status: 'Pending' });

      // Recent payroll activities (last 5 entries)
      const recentActivity = await Payroll.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('employee', 'fullName department employeeId');

      res.status(200).json({
        success: true,
        data: {
          totalEmployees,
          totalPayrollThisMonth,
          pendingPayrollAmount,
          pendingPayrollCount,
          pendingLeavesCount,
          recentActivity,
        },
      });
    } else {
      // --- EMPLOYEE STATS ---
      const empId = req.user.employeeProfile;
      if (!empId) {
        return res.status(200).json({
          success: true,
          data: {
            mySalarySummary: { baseSalary: 0, netSalary: 0 },
            payslipsCount: 0,
            pendingLeavesCount: 0,
            recentPayslips: [],
          },
        });
      }

      const employee = await Employee.findById(empId);
      const allMyPayrolls = await Payroll.find({ employee: empId }).sort({ month: -1 });

      const paidPayslips = allMyPayrolls.filter(p => p.status === 'Paid');
      const latestPaid = paidPayslips.length > 0 ? paidPayslips[0].netSalary : 0;
      
      const pendingLeavesCount = await Leave.countDocuments({ employee: empId, status: 'Pending' });

      res.status(200).json({
        success: true,
        data: {
          mySalarySummary: {
            baseSalary: employee ? employee.salaryStructure.baseSalary : 0,
            netSalary: latestPaid,
          },
          payslipsCount: allMyPayrolls.length,
          pendingLeavesCount,
          recentPayslips: allMyPayrolls.slice(0, 5),
        },
      });
    }
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayrolls,
  getPayrollById,
  generatePayroll,
  payPayroll,
  getDashboardStats,
};
