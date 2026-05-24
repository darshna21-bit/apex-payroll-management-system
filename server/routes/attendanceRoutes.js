const express = require('express');
const router = express.Router();
const { getAttendance, logAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAttendance)
  .post(protect, logAttendance);

module.exports = router;
