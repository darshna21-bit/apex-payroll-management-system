# ApexPayroll — MERN Stack Payroll Management System

ApexPayroll is a modern MERN-based Payroll Management System with secure authentication, employee management, payroll workflows, attendance tracking, and role-based dashboards. Built as a technical assessment, this project highlights standard full-stack patterns, secure authorization, database constraints, and clean user experience flows.

---

## Quick Start

Install dependencies:
```bash
npm install
```
*(Note: To install all root, backend, and frontend dependencies at once, you can also run `npm run install-all`)*

Seed database:
```bash
npm run seed
```

Run app:
```bash
npm run dev
```

Admin Login:
- **Email**: `admin@payroll.com`
- **Password**: `admin123`

---

## Features & Modules

### 1. JWT Authentication
- **Secure Sessions**: Token-based authentication using JSON Web Tokens (JWT) stored in client memory/storage.
- **Security Primitives**: Password hashing using `bcryptjs` on the database schema layer before storage.
- **Client Interceptors**: Custom Axios request interceptors automatically append Bearer tokens to outgoing API calls.
- **Error Boundaries**: Response interceptors handle expired sessions cleanly and redirect users back to the login screen, preserving typed inputs and showing clear inline error messages.

### 2. Role-Based Portals & Route Security
- **Access Restrictions**: Route guards (`AdminRoute`) protect core payroll processing and employee CRUD actions.
- **Personal Employee Portal**: Non-admin employees log into a dedicated dashboard restricted to their personal salary histories, attendance clock-ins, and leave applications.

### 3. Employee Registry (Admin)
- **Fuzzy Search & Filtering**: HR can query employee profiles by full name or corporate ID, filtering by department and status.
- **Form Controls**: Advanced modal interfaces to register new hires, modify salary packages, and deactivate accounts.
- **Credential Provisioning**: Creating a new Employee profile automatically provisions their portal login details, providing a seamless HR workflow.

### 4. Monthly Payroll Generation
- **Dynamic Invoicing Ledger**: Automatically calculates Base Salary + Allowances + Bonuses - Taxes (Provident Fund and income taxes).
- **Compound Database Gating**: Utilizes compound unique database indices (`employee` + `month`) preventing double-generation of payroll ledgers for the same employee within the same calendar month.
- **Payout Controls**: HR can review ledgers and release payouts, marking sheets as "Paid" and unlocking them for employee view.

### 5. Vector Printable Payslips
- **Invoice Layouts**: Generates highly detailed professional payslips outlining employer details, employee metadata, and side-by-side transaction balances.
- **Print Optimization**: Integrates specialized print-media CSS styles (`@media print`) enabling recruiters and staff to print or export high-resolution vector PDF payslips directly from their browser (`Ctrl+P` or via the interactive print button) without heavy external library dependencies.

### 6. Daily Attendance Registers
- **Check-ins**: Quick attendance logging support enabling employees to register their presence, absence, or leave for today.
- **Administrative Correction**: Admins can log or correct logs for employees for today or any past date.
- **Business Rule Constraints**: The backend strictly validates that no employee can have duplicate registers on the same date, and prevents logging attendance for future dates.

### 7. Gated Leave Allocation Request Board
- **Leave Request Management**: Employees submit leave requests outlining dates, leave categories (Sick, Casual, Earned, etc.), and text descriptions.
- **Manager Approval Logs**: Admins receive and review leave logs in a clean approval table. Approved actions store auditor names and link directly into attendance calculations.

### 8. Analytics & Visualizations
- **Header Alert Dropdown**: Lightweight, real-time looking header notification dropdown alerts HR when leaves are filed, employees join, or attendance updates occur.
- **Analytics Charts**: Interactive charts (`Recharts`) showcase company financial trends: salary distributions, department count splits, and annual corporate payroll expenses.

---

## Tech Stack

- **Frontend**: React, TailwindCSS, Axios, Recharts, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JWT, bcryptjs, dotenv, CORS

---

## Project Structure

```
c:\Assignment\
  ├── package.json               # Root package.json (concurrently launches client + server)
  ├── README.md                  # Comprehensive manual
  ├── client\                    # React Frontend
  │     ├── package.json         # Tailwind + PostCSS + Axios + Recharts
  │     ├── vite.config.js       # Vite configuration with local proxy configurations
  │     ├── tailwind.config.js   # Branding color extensions
  │     ├── index.html           # HTML5 SEO tags and Google font integrations
  │     └── src\
  │           ├── main.jsx       # App bootstrap entry
  │           ├── index.css      # Core styles & print layout media rules
  │           ├── App.jsx        # Route maps and Nest Layouts
  │           ├── context\
  │           │     └── AuthContext.jsx # Centralized auth state & auto-logins
  │           ├── layouts\
  │           │     ├── DashboardLayout.jsx # Authenticated sidebar + top navigation
  │           │     └── AuthLayout.jsx      # Unauthenticated login/register card views
  │           ├── components\
  │           │     ├── Sidebar.jsx     # Side menu matching active roles
  │           │     └── Navbar.jsx      # Interactive profile and custom notification dropdown
  │           └── pages\
  │                 ├── Login.jsx       # Standard/Admin Login panel
  │                 ├── Register.jsx    # System Owner registration
  │                 ├── AdminDashboard.jsx    # Charts, quick statistics, recent logs
  │                 ├── EmployeeDashboard.jsx # Pay summaries, payslips list, attendance
  │                 ├── EmployeeManagement.jsx # Advanced Employee CRUD grids
  │                 ├── PayrollManagement.jsx  # Process payroll, generate invoices
  │                 ├── PayslipView.jsx  # Invoice billing card & print commands
  │                 ├── Attendance.jsx   # Attendance registries
  │                 └── LeaveManagement.jsx # Leave requests & approval panels
  └── server\                    # Node + Express Backend
        ├── package.json         # Express + Mongoose + bcrypt + JWT
        ├── index.js             # API Gateway & database controller
        ├── config\
        │     └── db.js          # MongoDB connection handlers
        ├── models\
        │     ├── User.js        # User model (encryption pre-saves)
        │     ├── Employee.js    # Comprehensive profile schemas
        │     ├── Attendance.js  # Date unique compound attendance logs
        │     ├── Leave.js       # Leave application schemas
        │     └── Payroll.js     # Compound unique monthly payroll ledgers
        ├── middleware\
        │     ├── authMiddleware.js  # JWT parser & route guard policies
        │     └── errorMiddleware.js # Standard corporate exception handler
        ├── controllers\         # MVC controller route handlers
        ├── routes\              # Express router setups
        └── utils\
              ├── payrollCalculator.js # Income tax & pension deduction math
              └── seed.js        # Database seeder script
```

---

## Detailed Local Installation

Ensure you have **Node.js** (v18+) and **MongoDB** (local database or cloud cluster) installed.

### 1. Install Dependencies
ApexPayroll contains a unified installer in the root folder that configures dependencies for the root environment, backend `/server`, and frontend `/client` in a single command:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create an `.env` file under the `/server` directory. A template configuration is shown below:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```
*(The system is fully compatible with MongoDB Local Community Server or MongoDB Atlas Cloud databases).*

### 3. Seed the Database
Pre-populate the database with realistic mock data, including an Administrator account, active employee profiles, 5 days of attendance registers, payroll ledgers, and leave logs:
```bash
npm run seed
```

### 4. Run the Platform
Launch both the Express backend and Vite React frontend concurrently:
```bash
npm run dev
```
- **React Frontend**: http://localhost:3000
- **Express Backend**: http://localhost:5000

---

## Seed Credentials

For a complete and rapid inspection of the system, use these pre-loaded accounts after running the database seed script:

### 🌟 Portal Administrator (Full Access Privileges)
- **Email**: `admin@payroll.com`
- **Password**: `admin123`

### 💼 Standard Employee Accounts (Personnel View)
- **John Doe (Engineering)**
  - **Email**: `john@payroll.com`
  - **Password**: `EMP001123`
- **Sarah Jenkins (Human Resources)**
  - **Email**: `sarah@payroll.com`
  - **Password**: `EMP002123`
- **Michael Scott (Sales Manager)**
  - **Email**: `michael@payroll.com`
  - **Password**: `EMP003123`

---

## Deployment Readiness

ApexPayroll is optimized for continuous delivery and can be quickly launched on cloud platforms:
- **Build Configurations**: Standard Vite production builds (`npm run build`) generate compact static files with chunk splitters, reducing page load sizes.
- **Centralized Environment Routing**: Relative proxying configurations inside `vite.config.js` redirect backend calls seamlessly in development and resolve absolute production routes natively once built.
- **Client-Side PDF Mechanics**: Utilizing HTML print stylesheets ensures that no heavy server-side Chromium libraries (like Puppeteer) are needed, keeping the backend lightweight and 100% compatible with Render/Vercel free limits.

---

## Future Improvements Roadmap

To expand the scope beyond technical assessment standards:
1. **Real-time notifications**: Integrate WebSockets (`Socket.io`) on the server and client to push active HR alerts (leaves, check-ins) instantly.
2. **Bulk Payroll Import/Export**: Support uploading CSV/Excel sheets for registering hundreds of workers or editing monthly bonuses in batches.
3. **Automated Direct Deposit integration**: Add mock endpoints hooking into financial networks to simulate actual bank deposits on paydays.
4. **Enhanced Biometric Attendance**: Support geofencing or mock facial-recognition webcams for standard employees during clock-ins.
