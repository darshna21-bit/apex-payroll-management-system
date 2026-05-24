import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';
import { formatCurrency, formatMonth } from '../utils/formatters';
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  AlertCircle,
  X,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generation Modal States
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [customBonus, setCustomBonus] = useState('0');
  const [customDeductions, setCustomDeductions] = useState('0');
  const [genError, setGenError] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);
  
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Payment Confirmation states
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [payrollIdToPay, setPayrollIdToPay] = useState(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getPayrolls();
      if (res.success) {
        setPayrolls(res.data);
      } else {
        setError(res.message || 'Failed to fetch payroll history');
      }
    } catch (err) {
      console.error('Error fetching payrolls:', err);
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
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setGenError('');

    if (!selectedEmpId || !selectedMonth) {
      setGenError('Please select both employee and month');
      return;
    }

    try {
      const res = await payrollService.generatePayroll({
        employeeId: selectedEmpId,
        month: selectedMonth,
        customBonus: Number(customBonus) || 0,
        customDeductions: Number(customDeductions) || 0,
      });

      if (res.success) {
        setShowGenModal(false);
        resetGenForm();
        fetchPayrolls();
      } else {
        setGenError(res.message || 'Generation failed');
      }
    } catch (err) {
      console.error('Gen error:', err);
      setGenError(err.response?.data?.message || 'Server error generating payroll.');
    }
  };

  const handleProcessPayment = (id) => {
    setPayrollIdToPay(id);
    setShowPayConfirm(true);
  };

  const executePayment = async () => {
    try {
      const res = await payrollService.payPayroll(payrollIdToPay);
      if (res.success) {
        fetchPayrolls();
        showToast('success', 'Payroll salary marked as paid successfully!');
      } else {
        showToast('error', res.message || 'Payment execution failed.');
      }
    } catch (err) {
      console.error('Pay error:', err);
      showToast('error', 'Server connection error during payment execution.');
    } finally {
      setShowPayConfirm(false);
      setPayrollIdToPay(null);
    }
  };

  const resetGenForm = () => {
    setSelectedEmpId('');
    setSelectedMonth('');
    setCustomBonus('0');
    setCustomDeductions('0');
    setGenError('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Payroll Ledger Management</h2>
          <p className="text-sm text-slate-500">Generate monthly corporate salaries, add adjustments, and execute payments</p>
        </div>
        <button
          onClick={() => { resetGenForm(); setShowGenModal(true); }}
          className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Salary Ledger</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-4 text-rose-600 border border-rose-100">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase">
                <th className="px-6 py-3.5">Employee Details</th>
                <th className="px-6 py-3.5">Salary Month</th>
                <th className="px-6 py-3.5">Base Salary</th>
                <th className="px-6 py-3.5">Net Payout</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                  </td>
                </tr>
              ) : payrolls.length > 0 ? (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">
                          {p.employee?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 leading-tight">{p.employee?.fullName}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">{p.employee?.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatMonth(p.month)}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatCurrency(p.baseSalary)}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(p.netSalary)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        {p.status === 'Pending' && (
                          <button
                            onClick={() => handleProcessPayment(p._id)}
                            className="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors"
                          >
                            <span>Mark Paid</span>
                          </button>
                        )}
                        <Link
                          to={`/payslip/${p._id}`}
                          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Payslip</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    No payroll ledgers recorded in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE PAYROLL MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <button
              onClick={() => setShowGenModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center">
              <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-600" />
              Generate Salary Ledger
            </h3>

            {genError && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Target Employee</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Month */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Salary Month</label>
                <input
                  type="month"
                  required
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Custom Adjustments */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Adjustments ($)</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Bonus</label>
                    <input
                      type="number"
                      value={customBonus}
                      onChange={(e) => setCustomBonus(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Deductions</label>
                    <input
                      type="number"
                      value={customDeductions}
                      onChange={(e) => setCustomDeductions(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
                >
                  Create Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT CONFIRMATION MODAL */}
      {showPayConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 border border-emerald-100 mb-2">
                <CheckCircle className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Process Salary Payout?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to process the payment transfer for this employee? This will finalize their monthly payslip.
              </p>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => { setShowPayConfirm(false); setPayrollIdToPay(null); }}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePayment}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

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

export default PayrollManagement;
