import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import payrollService from '../services/payrollService';
import { formatCurrency, formatMonth, formatDate } from '../utils/formatters';
import {
  FileText,
  Printer,
  ChevronLeft,
  AlertCircle,
  Building,
  CheckCircle,
  CornerDownRight
} from 'lucide-react';

const PayslipView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await payrollService.getPayrollById(id);
        if (res.success) {
          setPayroll(res.data);
        } else {
          setError(res.message || 'Payslip record not found');
        }
      } catch (err) {
        console.error('Error fetching payslip:', err);
        setError('Error loading payslip details from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

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

  const { employee } = payroll;
  const totalEarnings = payroll.baseSalary + payroll.allowances + payroll.bonus;
  const totalDeductions = payroll.taxDeduction + payroll.pfDeduction + payroll.otherDeductions;

  return (
    <div className="space-y-6">
      {/* Controls Bar (hidden during standard print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Payslip Invoice Sheet */}
      <div className="printable-payslip mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <Building className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-800">APEX LEDGERS INC.</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Corporate Headquarters</span>
            </div>
          </div>
          <div className="flex flex-col sm:text-right">
            <span className="text-lg font-extrabold text-blue-600 uppercase tracking-tight">Official Payslip</span>
            <span className="text-xs text-slate-500 font-medium">Month: {formatMonth(payroll.month)}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1">Ref: {payroll._id}</span>
          </div>
        </div>

        {/* Informative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100">
          {/* Employee profile details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Employee Details</h4>
            <div className="text-sm space-y-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Name:</span> <span className="font-bold text-slate-800">{employee?.fullName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Employee ID:</span> <span className="font-mono text-slate-700 font-bold">{employee?.employeeId}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Department:</span> <span className="text-slate-600 font-semibold">{employee?.department}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Designation:</span> <span className="text-slate-600 font-semibold">{employee?.designation}</span></div>
            </div>
          </div>

          {/* Payment metadata */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Summary</h4>
            <div className="text-sm space-y-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Email:</span> <span className="text-slate-600 font-medium">{employee?.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Joining Date:</span> <span className="text-slate-600 font-semibold">{formatDate(employee?.joiningDate)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Status:</span> <span className="font-bold text-emerald-600 flex items-center"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Paid</span></div>
              <div className="flex justify-between"><span className="text-slate-400 font-medium">Processed Date:</span> <span className="text-slate-600 font-semibold">{formatDate(payroll.paymentDate || payroll.updatedAt)}</span></div>
            </div>
          </div>
        </div>

        {/* Core Ledgers Table breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center">
              <CornerDownRight className="h-3.5 w-3.5 text-blue-500 mr-1" />
              Earnings Breakdown
            </h4>
            <div className="text-xs space-y-2.5">
              <div className="flex justify-between"><span>Base Salary</span> <span className="font-bold text-slate-700">{formatCurrency(payroll.baseSalary)}</span></div>
              <div className="flex justify-between"><span>Allowances</span> <span className="font-semibold text-slate-600">{formatCurrency(payroll.allowances)}</span></div>
              <div className="flex justify-between"><span>Bonus Adjustments</span> <span className="font-semibold text-slate-600">{formatCurrency(payroll.bonus)}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5 text-sm font-bold text-slate-800">
                <span>Gross Earnings</span>
                <span>{formatCurrency(totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center">
              <CornerDownRight className="h-3.5 w-3.5 text-rose-500 mr-1" />
              Deductions Breakdown
            </h4>
            <div className="text-xs space-y-2.5">
              <div className="flex justify-between"><span>Tax Deduction</span> <span className="font-semibold text-slate-600">{formatCurrency(payroll.taxDeduction)}</span></div>
              <div className="flex justify-between"><span>Provident Fund (PF)</span> <span className="font-semibold text-slate-600">{formatCurrency(payroll.pfDeduction)}</span></div>
              <div className="flex justify-between"><span>Other Deductions</span> <span className="font-semibold text-slate-600">{formatCurrency(payroll.otherDeductions)}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5 text-sm font-bold text-slate-800">
                <span>Total Deductions</span>
                <span>{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Net Salary Payout</span>
            <p className="text-[11px] text-slate-400 leading-none">Net Pay = Gross Earnings - Total Deductions</p>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
            {formatCurrency(payroll.netSalary)}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-slate-100 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-10 border-b border-slate-300 w-36 mb-1.5"></div>
            <span className="text-slate-400 font-medium">Employee Signature</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-10 border-b border-slate-300 w-36 mb-1.5 flex items-center justify-center font-serif italic text-blue-700 text-sm select-none">
              ApexLedgers
            </div>
            <span className="text-slate-400 font-medium">Authorized Signatory</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayslipView;
