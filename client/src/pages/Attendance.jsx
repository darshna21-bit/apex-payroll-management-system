import React, { useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import useAuth from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import {
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  UserCheck
} from 'lucide-react';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Daily log state for employees
  const [checkingIn, setCheckingIn] = useState(false);
  const [dailyStatus, setDailyStatus] = useState('Present');

  // Admin log state on behalf of employee
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [adminStatus, setAdminStatus] = useState('Present');
  const [adminDate, setAdminDate] = useState(new Date().toISOString().substring(0, 10));
  const [adminError, setAdminError] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);
  
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAttendance();
      if (res.success) {
        setLogs(res.data);
      } else {
        setError(res.message || 'Failed to load attendance logs');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Connection failure to API server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getEmployees();
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Error fetching employee list:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setError('');
    try {
      const res = await attendanceService.logAttendance({
        status: dailyStatus,
      });
      if (res.success) {
        fetchAttendance();
        showToast('success', 'Attendance registered successfully for today!');
      } else {
        setError(res.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Daily attendance already registered for today!');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    if (!selectedEmpId) {
      setAdminError('Please select an employee');
      return;
    }

    const todayDate = new Date().toISOString().substring(0, 10);
    if (adminDate > todayDate) {
      setAdminError('Future attendance dates are not allowed');
      return;
    }

    try {
      const res = await attendanceService.logAttendance({
        employeeId: selectedEmpId,
        status: adminStatus,
        date: adminDate,
      });

      if (res.success) {
        fetchAttendance();
        setSelectedEmpId('');
        setAdminError('');
        showToast('success', 'Staff attendance recorded successfully!');
      }
    } catch (err) {
      console.error('Admin log error:', err);
      const errMsg = err.response?.data?.message || 'Error recording staff attendance.';
      setAdminError(errMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Shift Attendance Logs</h2>
        <p className="text-sm text-slate-500">Record daily status, view histories, and track staff check-ins</p>
      </div>

      {/* Main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Controls Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          {!isAdmin ? (
            // --- EMPLOYEE CHECK-IN PANEL ---
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-500" />
                Daily Register
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose your current attendance status and click check-in to log your shift for today ({new Date().toLocaleDateString()}).
              </p>
              
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase">Check-In Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Leave'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDailyStatus(st)}
                      className={`rounded-lg py-2 text-xs font-bold border transition-colors ${
                        dailyStatus === st
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-1.5 rounded-lg bg-rose-50 p-3 text-[11px] text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full mt-4 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {checkingIn ? 'Registering...' : 'Register Shift'}
              </button>
            </div>
          ) : (
            // --- ADMIN LOG FOR STAFF ---
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-blue-500" />
                Record Staff Check-In
              </h4>

              {adminError && (
                <div className="flex items-center space-x-1.5 rounded-lg bg-rose-50 p-3 text-[11px] text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}
              
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Employee</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Shift Date</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().substring(0, 10)}
                  value={adminDate}
                  onChange={(e) => setAdminDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Select Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Attendance Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Leave'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAdminStatus(st)}
                      className={`rounded-lg py-2 text-xs font-bold border transition-colors ${
                        adminStatus === st
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                Log Attendance
              </button>
            </form>
          )}
        </div>

        {/* History logs Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">
            Shift Logs History
          </h4>

          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase">
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{log.employee?.fullName}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{log.employee?.employeeId}</span>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-slate-600">{formatDate(log.date)}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            log.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : log.status === 'Absent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-medium">
                      No shift records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 rounded-xl border px-4 py-3 shadow-xl transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Attendance;
