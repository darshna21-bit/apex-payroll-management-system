const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: String, // format YYYY-MM
      required: [true, 'Month is required'],
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
    },
    allowances: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    taxDeduction: {
      type: Number,
      default: 0,
    },
    pfDeduction: {
      type: Number,
      default: 0,
    },
    otherDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: [true, 'Net salary is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique payroll per employee per month
payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;
