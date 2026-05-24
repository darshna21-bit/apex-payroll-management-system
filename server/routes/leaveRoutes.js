const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLeaves)
  .post(protect, authorize('employee'), applyLeave);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateLeaveStatus);

module.exports = router;
