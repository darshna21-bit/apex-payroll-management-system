const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: [0, 'Base salary cannot be negative'],
  },
  allowances: {
    type: Number,
    default: 0,
    min: [0, 'Allowances cannot be negative'],
  },
  bonus: {
    type: Number,
    default: 0,
    min: [0, 'Bonus cannot be negative'],
  },
  pfDeduction: {
    type: Number,
    default: 0,
    min: [0, 'Provident Fund deduction cannot be negative'],
  },
  taxDeduction: {
    type: Number,
    default: 0,
    min: [0, 'Tax deduction cannot be negative'],
  },
  otherDeductions: {
    type: Number,
    default: 0,
    min: [0, 'Other deductions cannot be negative'],
  },
});

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    salaryStructure: {
      type: salaryStructureSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
