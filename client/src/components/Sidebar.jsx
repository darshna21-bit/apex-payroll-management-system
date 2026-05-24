import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarDays,
  FileSpreadsheet,
  LogOut,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/payroll', label: 'Payroll Ledger', icon: CreditCard },
    { to: '/attendance', label: 'Attendance', icon: CalendarDays },
    { to: '/leaves', label: 'Leave Requests', icon: FileSpreadsheet },
  ];

  const employeeLinks = [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'My Attendance', icon: CalendarDays },
    { to: '/leaves', label: 'Leave Application', icon: FileSpreadsheet },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-blue-600 p-1.5">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            ApexPayroll
          </span>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-blue-400 font-bold border border-slate-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-slate-100">{user?.name}</span>
          <span className="truncate text-xs text-slate-400 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 hover:text-opacity-100 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
