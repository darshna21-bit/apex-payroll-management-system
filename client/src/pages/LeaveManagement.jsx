import React, { useState, useEffect } from 'react';
import leaveService from '../services/leaveService';
import useAuth from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

const LeaveManagement = () => {
  const { user, isAdmin } = useAuth();
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply Form State (Employee only)
  const [leaveType, setLeaveType] = useState('Sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);
  
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveService.getLeaves();
      if (res.success) {
        setLeaves(res.data);
      } else {
        setError(res.message || 'Failed to load leave records');
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Connection failure to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!startDate || !endDate || !reason) {
      setFormError('Please complete all form fields');
      return;
    }

    try {
      const res = await leaveService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.success) {
        setFormSuccess('Leave application submitted successfully!');
        resetForm();
        fetchLeaves();
      }
    } catch (err) {
      console.error('Apply leave error:', err);
      setFormError(err.response?.data?.message || 'Error submitting leave request.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await leaveService.updateLeaveStatus(id, 'Approved');
      if (res.success) {
        fetchLeaves();
        showToast('success', 'Leave application approved successfully.');
      } else {
        showToast('error', res.message || 'Error updating leave status.');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast('error', 'Error updating leave status.');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await leaveService.updateLeaveStatus(id, 'Rejected');
      if (res.success) {
        fetchLeaves();
        showToast('success', 'Leave application rejected successfully.');
      } else {
        showToast('error', res.message || 'Error updating leave status.');
      }
    } catch (err) {
      console.error('Reject error:', err);
      showToast('error', 'Error updating leave status.');
    }
  };

  const resetForm = () => {
    setLeaveType('Sick');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Leave Management Panel</h2>
        <p className="text-sm text-slate-500">Apply for corporate leave, track application states, and process staff approvals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          {!isAdmin ? (
            // --- EMPLOYEE LEAVE APPLICATION ---
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Apply for Leave
              </h4>

              {formError && (
                <div className="flex items-center space-x-1.5 rounded-lg bg-rose-50 p-3 text-[11px] text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-50 p-3 text-[11px] text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Leave Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Other">Other Leave</option>
                </select>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                  placeholder="State the reason clearly..."
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                Submit Request
              </button>
            </form>
          ) : (
            // --- ADMIN EXPLANATORY NOTE ---
            <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-500" />
                Approvals Guidelines
              </h4>
              <p>
                As a system administrator, you can review all active leave request summaries submitted by employees.
              </p>
              <p>
                Click <span className="font-bold text-emerald-600">Approve</span> or <span className="font-bold text-rose-600">Reject</span> in the registry grid to process leaves instantly. Processed requests will showcase the processing manager name.
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 font-medium text-slate-600">
                Processed logs are locked automatically to maintain auditable company registries.
              </div>
            </div>
          )}
        </div>

        {/* Registry History List */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">
            Leave Registry History
          </h4>

          <div className="overflow-y-auto max-h-[65vh]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase">
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Leave details</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  {isAdmin && <th className="pb-3 font-semibold text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-6 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                    </td>
                  </tr>
                ) : leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{leave.employee?.fullName}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{leave.employee?.employeeId}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col max-w-xs">
                          <span className="font-semibold text-slate-700">{leave.leaveType} Leave</span>
                          <span className="text-xs text-slate-400 truncate mt-0.5" title={leave.reason}>{leave.reason}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col text-xs text-slate-600">
                          <span>From: <strong className="font-medium text-slate-700">{formatDate(leave.startDate)}</strong></span>
                          <span>To: <strong className="font-medium text-slate-700">{formatDate(leave.endDate)}</strong></span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {leave.status}
                        </span>
                        {leave.status !== 'Pending' && leave.approvedBy && (
                          <span className="block text-[9px] text-slate-400 mt-1">By: {leave.approvedBy.name}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 text-center">
                          {leave.status === 'Pending' ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleApprove(leave._id)}
                                className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Approve Leave"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(leave._id)}
                                className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="Reject Leave"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Locked</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-400 font-medium">
                      No leave applications found.
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

export default LeaveManagement;
