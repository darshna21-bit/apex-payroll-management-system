import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import payrollService from '../services/payrollService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
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
          setError(res.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
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

  // Visual chart mock data based on seeded DB
  const chartData = [
    { name: 'Engineering', Headcount: 1, Budget: 72000 },
    { name: 'HR', Headcount: 1, Budget: 59500 },
    { name: 'Sales', Headcount: 1, Budget: 100000 },
  ];

  const distributionData = [
    { name: 'Engineering', value: 1 },
    { name: 'Human Resources', value: 1 },
    { name: 'Sales', value: 1 },
  ];

  const cards = [
    {
      title: 'Active Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Monthly Paid Payroll',
      value: formatCurrency(stats?.totalPayrollThisMonth),
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'Pending Settlements',
      value: formatCurrency(stats?.pendingPayrollAmount),
      icon: Clock,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Leave Applications',
      value: stats?.pendingLeavesCount || 0,
      icon: AlertCircle,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Administrative Control Dashboard</h2>
        <p className="text-sm text-slate-500">Real-time statistics, monthly expenses, and pending operational requests</p>
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

      {/* Charts Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget breakdown bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
              Departmental Monthly Budget ($)
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount breakdown pie chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
            <Activity className="mr-2 h-4 w-4 text-emerald-500" />
            Headcount Split
          </h4>
          <div className="h-60 relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-800">{stats?.totalEmployees || 0}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Staff</span>
            </div>
          </div>
          {/* Pie Chart Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
            {distributionData.map((d, index) => (
              <div key={index} className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-500 font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Recent Payroll Action Ledger
          </h4>
          <Link
            to="/payroll"
            className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-500"
          >
            Manage Payrolls
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase">
                <th className="pb-3 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Month</th>
                <th className="pb-3 font-semibold">Net Pay</th>
                <th className="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-800">{activity.employee?.fullName}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{activity.employee?.employeeId}</td>
                    <td className="py-3 text-slate-500">{activity.employee?.department}</td>
                    <td className="py-3 text-slate-800 font-medium">{activity.month}</td>
                    <td className="py-3 font-bold text-slate-800">{formatCurrency(activity.netSalary)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          activity.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No payroll activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
