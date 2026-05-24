const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  getPayrollById,
  generatePayroll,
  payPayroll,
  getDashboardStats,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get high-level stats for dashboards
router.get('/stats', protect, getDashboardStats);

// General payroll listing and admin payroll generation
router.route('/')
  .get(protect, getPayrolls)
  .post(protect, authorize('admin'), generatePayroll);

// Route for explicit RPC-style generation path called by frontend Axios service
router.post('/generate', protect, authorize('admin'), generatePayroll);

// Individual payslip and payment processing routes
router.route('/:id')
  .get(protect, getPayrollById);

router.route('/:id/pay')
  .put(protect, authorize('admin'), payPayroll);

module.exports = router;
