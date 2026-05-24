require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://apex-payroll-client.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());
app.use(express.json());

// API Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Payroll Management System API is fully operational' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));

// Global Error Handler Middleware
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections safely
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
