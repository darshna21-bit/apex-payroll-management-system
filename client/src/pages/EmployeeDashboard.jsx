import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import payrollService from '../services/payrollService';
import { formatCurrency, formatMonth, formatDate } from '../utils/formatters';
import {
  DollarSign,
  Calendar,
  FileText,
  Clock,
  ArrowUpRight,
  Eye,
  AlertCircle
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await payrollService.getStats();
        if (res.success) {
          setStats(res.data);
        } else {
          setError(res.message || 'Failed to load employee metrics');
        }
      } catch (err) {
        console.error('Error fetching employee dashboard stats:', err);
        setError('Error connecting to backend services.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-6 text-rose-600 border border-rose-100">
        <AlertCircle className="h-6 w-6" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  const { mySalarySummary, payslipsCount, pendingLeavesCount, recentPayslips } = stats || {};

  const cards = [
    {
      title: 'Base Salary',
      value: formatCurrency(mySalarySummary?.baseSalary),
      icon: DollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Last Net Payout',
      value: formatCurrency(mySalarySummary?.netSalary),
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'Total Issued Payslips',
      value: payslipsCount || 0,
      icon: FileText,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
    },
    {
      title: 'Pending Leaves',
      value: pendingLeavesCount || 0,
      icon: Clock,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Personnel Portal</h2>
        <p className="text-sm text-slate-500">Access your earnings summary, track attendance, and download formal payslips</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
                <h3 className="text-2xl font-extrabold text-slate-800">{card.value}</h3>
              </div>
              <div className={`rounded-xl p-3.5 ${card.bgLight} ${card.textColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Payslips Ledger */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Payslip Ledger History
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase">
                  <th className="pb-3 font-semibold">Salary Month</th>
                  <th className="pb-3 font-semibold">Payment Status</th>
                  <th className="pb-3 font-semibold">Net Payout</th>
                  <th className="pb-3 font-semibold text-center">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentPayslips && recentPayslips.length > 0 ? (
                  recentPayslips.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-semibold text-slate-800">{formatMonth(payroll.month)}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            payroll.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">{formatCurrency(payroll.netSalary)}</td>
                      <td className="py-3.5 text-center">
                        <Link
                          to={`/payslip/${payroll._id}`}
                          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Sheet</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No payslip records generated for you yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Quick Portals Links
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use the links below to instantly check-in for today's shifts or apply for sick leave and casuality leaves.
            </p>
            <div className="space-y-2 pt-2">
              <Link
                to="/attendance"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
              >
                <span>Record Daily Attendance</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                to="/leaves"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
              >
                <span>Apply for Leaves</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
          
          <div className="mt-6 border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-medium">
            Contact payroll@company.com for query resolutions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
