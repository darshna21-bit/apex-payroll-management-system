const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin only actions
router.route('/')
  .get(protect, authorize('admin'), getEmployees)
  .post(protect, authorize('admin'), createEmployee);

// General auth check but manual owner-authorization inside the controller for GET
router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('admin'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;
