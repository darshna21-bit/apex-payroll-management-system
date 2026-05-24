require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});

    console.log('Database cleared.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@payroll.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user seeded: admin@payroll.com / admin123');

    // 2. Create Employee Users & Profiles
    const employeeData = [
      {
        fullName: 'John Doe',
        email: 'john@payroll.com',
        phone: '+1-555-0199',
        employeeId: 'EMP001',
        department: 'Engineering',
        designation: 'Software Developer',
        joiningDate: new Date('2024-01-15'),
        salaryStructure: {
          baseSalary: 65000,
          allowances: 5000,
          bonus: 2000,
          pfDeduction: 1200,
          taxDeduction: 6500,
          otherDeductions: 300,
        },
      },
      {
        fullName: 'Sarah Jenkins',
        email: 'sarah@payroll.com',
        phone: '+1-555-0182',
        employeeId: 'EMP002',
        department: 'Human Resources',
        designation: 'HR Specialist',
        joiningDate: new Date('2024-03-01'),
        salaryStructure: {
          baseSalary: 55000,
          allowances: 3500,
          bonus: 1000,
          pfDeduction: 990,
          taxDeduction: 4400,
          otherDeductions: 0,
        },
      },
      {
        fullName: 'Michael Scott',
        email: 'michael@payroll.com',
        phone: '+1-555-0120',
        employeeId: 'EMP003',
        department: 'Sales',
        designation: 'Regional Manager',
        joiningDate: new Date('2022-06-10'),
        salaryStructure: {
          baseSalary: 75000,
          allowances: 10000,
          bonus: 15000,
          pfDeduction: 1500,
          taxDeduction: 9500,
          otherDeductions: 1000,
        },
      },
    ];

    const employees = [];

    for (const emp of employeeData) {
      // Create user login credential
      const user = await User.create({
        name: emp.fullName,
        email: emp.email,
        password: `${emp.employeeId}123`,
        role: 'employee',
      });

      // Create Employee profile
      const employee = await Employee.create({
        user: user._id,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        employeeId: emp.employeeId,
        department: emp.department,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        status: 'active',
        salaryStructure: emp.salaryStructure,
      });

      // Establish bidirectional link
      user.employeeProfile = employee._id;
      await user.save();
      
      employees.push(employee);
      console.log(`Seeded employee: ${emp.fullName} (${emp.email}) / password: ${emp.employeeId}123`);
    }

    // 3. Seed Attendance Logs
    // Let's seed for the last few days
    const today = new Date();
    const datesToSeed = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      datesToSeed.push(d.toISOString().substring(0, 10));
    }

    const statuses = ['Present', 'Present', 'Present', 'Absent', 'Present'];
    
    for (const employee of employees) {
      for (let idx = 0; idx < datesToSeed.length; idx++) {
        // Skip some so not all dates are identical
        if (employee.employeeId === 'EMP002' && idx === 3) {
          await Attendance.create({
            employee: employee._id,
            date: datesToSeed[idx],
            status: 'Leave',
          });
        } else {
          await Attendance.create({
            employee: employee._id,
            date: datesToSeed[idx],
            status: statuses[(idx + employee.fullName.length) % statuses.length],
          });
        }
      }
    }
    console.log('Seeded 5-day attendance history.');

    // 4. Seed Leave Requests
    await Leave.create({
      employee: employees[0]._id, // John Doe
      leaveType: 'Sick',
      startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      reason: 'Suffering from viral fever.',
      status: 'Approved',
      approvedBy: adminUser._id,
    });

    await Leave.create({
      employee: employees[1]._id, // Sarah Jenkins
      leaveType: 'Casual',
      startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      reason: 'Family event out of town.',
      status: 'Pending',
    });
    console.log('Seeded leave records.');

    // 5. Seed Payroll History
    // Let's seed previous month (Paid) and current month (Pending)
    const prevMonth = '2026-04';
    const currMonth = '2026-05';

    for (const employee of employees) {
      const structure = employee.salaryStructure;
      
      // Seed Paid payroll for last month
      const prevGross = structure.baseSalary + structure.allowances;
      const prevDeductions = structure.pfDeduction + structure.taxDeduction + structure.otherDeductions;
      const prevNet = prevGross - prevDeductions;

      await Payroll.create({
        employee: employee._id,
        month: prevMonth,
        baseSalary: structure.baseSalary,
        allowances: structure.allowances,
        bonus: 0,
        pfDeduction: structure.pfDeduction,
        taxDeduction: structure.taxDeduction,
        otherDeductions: structure.otherDeductions,
        netSalary: prevNet,
        status: 'Paid',
        paymentDate: new Date('2026-04-30'),
      });

      // Seed Pending payroll for this month
      const currGross = structure.baseSalary + structure.allowances + structure.bonus;
      const currDeductions = structure.pfDeduction + structure.taxDeduction + structure.otherDeductions;
      const currNet = currGross - currDeductions;

      await Payroll.create({
        employee: employee._id,
        month: currMonth,
        baseSalary: structure.baseSalary,
        allowances: structure.allowances,
        bonus: structure.bonus,
        pfDeduction: structure.pfDeduction,
        taxDeduction: structure.taxDeduction,
        otherDeductions: structure.otherDeductions,
        netSalary: currNet,
        status: 'Pending',
      });
    }

    console.log('Seeded payroll history records.');
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
