import React, { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Key
} from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);
  
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState(null);
  
  // Credentials modal for new accounts
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [credsData, setCredsData] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
    baseSalary: '',
    allowances: '0',
    bonus: '0',
    pfDeduction: '0',
    taxDeduction: '0',
    otherDeductions: '0',
  });

  const [formError, setFormError] = useState('');

  const departments = ['Engineering', 'Human Resources', 'Sales', 'Finance', 'Marketing'];

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({
        search,
        department: selectedDept,
      });
      if (res.success) {
        setEmployees(res.data);
      } else {
        setError(res.message || 'Failed to load employee list');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Could not connect to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      employeeId: formData.employeeId,
      department: formData.department,
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      salaryStructure: {
        baseSalary: Number(formData.baseSalary) || 0,
        allowances: Number(formData.allowances) || 0,
        bonus: Number(formData.bonus) || 0,
        pfDeduction: Number(formData.pfDeduction) || 0,
        taxDeduction: Number(formData.taxDeduction) || 0,
        otherDeductions: Number(formData.otherDeductions) || 0,
      },
    };

    try {
      const res = await employeeService.createEmployee(payload);
      if (res.success) {
        setShowAddModal(false);
        setCredsData({
          email: res.credentials.email,
          password: res.credentials.password,
          fullName: res.data.fullName,
        });
        setShowCredsModal(true);
        resetForm();
        fetchEmployees();
      } else {
        setFormError(res.message || 'Validation failed');
      }
    } catch (err) {
      console.error('Create error:', err);
      setFormError(err.response?.data?.message || 'Server error creating employee.');
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      employeeId: employee.employeeId,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate.substring(0, 10),
      baseSalary: employee.salaryStructure.baseSalary.toString(),
      allowances: employee.salaryStructure.allowances.toString(),
      bonus: employee.salaryStructure.bonus.toString(),
      pfDeduction: employee.salaryStructure.pfDeduction.toString(),
      taxDeduction: employee.salaryStructure.taxDeduction.toString(),
      otherDeductions: employee.salaryStructure.otherDeductions.toString(),
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      salaryStructure: {
        baseSalary: Number(formData.baseSalary) || 0,
        allowances: Number(formData.allowances) || 0,
        bonus: Number(formData.bonus) || 0,
        pfDeduction: Number(formData.pfDeduction) || 0,
        taxDeduction: Number(formData.taxDeduction) || 0,
        otherDeductions: Number(formData.otherDeductions) || 0,
      },
    };

    try {
      const res = await employeeService.updateEmployee(selectedEmployee._id, payload);
      if (res.success) {
        setShowEditModal(false);
        setSelectedEmployee(null);
        resetForm();
        fetchEmployees();
      } else {
        setFormError(res.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setFormError(err.response?.data?.message || 'Server error updating employee.');
    }
  };

  const handleDeleteClick = (id) => {
    setEmployeeIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      const res = await employeeService.deleteEmployee(employeeIdToDelete);
      if (res.success) {
        fetchEmployees();
        showToast('success', 'Employee account deactivated successfully.');
      } else {
        showToast('error', res.message || 'Delete operation failed.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', 'Server connection error during delete.');
    } finally {
      setShowDeleteConfirm(false);
      setEmployeeIdToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      employeeId: '',
      department: '',
      designation: '',
      joiningDate: '',
      baseSalary: '',
      allowances: '0',
      bonus: '0',
      pfDeduction: '0',
      taxDeduction: '0',
      otherDeductions: '0',
    });
    setFormError('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Staff Management Registry</h2>
          <p className="text-sm text-slate-500">Add staff profiles, update active pay structures, and control portal logins</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search by staff name or corporate employee ID..."
          />
        </div>

        {/* Filter Department */}
        <div className="w-full sm:w-60">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-4 text-rose-600 border border-rose-100">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Table Registry */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase">
                <th className="px-6 py-3.5">Employee Details</th>
                <th className="px-6 py-3.5">ID / Dept</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Base Salary</th>
                <th className="px-6 py-3.5">Status</th>
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
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">
                          {emp.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 leading-tight">{emp.fullName}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-800 font-bold">{emp.employeeId}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{emp.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{emp.designation}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {formatCurrency(emp.salaryStructure.baseSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(emp._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    No employee profiles matched the query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Add Employee Registry</h3>

            {formError && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="+1 555-0182" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Employee ID</label>
                  <input type="text" name="employeeId" required value={formData.employeeId} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="EMP004" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Department</label>
                  <select name="department" required value={formData.department} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white">
                    <option value="">Select Department</option>
                    {departments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Designation</label>
                  <input type="text" name="designation" required value={formData.designation} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="Product Manager" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Joining Date</label>
                  <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              {/* Salary Fields */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Salary Structure ($)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Base Salary</label>
                    <input type="number" name="baseSalary" required value={formData.baseSalary} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" placeholder="60000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Allowances</label>
                    <input type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Bonus</label>
                    <input type="number" name="bonus" value={formData.bonus} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Provident Fund (PF)</label>
                    <input type="number" name="pfDeduction" value={formData.pfDeduction} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tax Deduction</label>
                    <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Other Deductions</label>
                    <input type="number" name="otherDeductions" value={formData.otherDeductions} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowEditModal(false); setSelectedEmployee(null); }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Edit Employee Registry</h3>

            {formError && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Department</label>
                  <select name="department" required value={formData.department} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 bg-white">
                    {departments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Designation</label>
                  <input type="text" name="designation" required value={formData.designation} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Joining Date</label>
                  <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              {/* Salary Fields */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Salary Structure ($)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Base Salary</label>
                    <input type="number" name="baseSalary" required value={formData.baseSalary} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Allowances</label>
                    <input type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Bonus</label>
                    <input type="number" name="bonus" value={formData.bonus} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Provident Fund (PF)</label>
                    <input type="number" name="pfDeduction" value={formData.pfDeduction} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tax Deduction</label>
                    <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Other Deductions</label>
                    <input type="number" name="otherDeductions" value={formData.otherDeductions} onChange={handleInputChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedEmployee(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS RECEIPT MODAL */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <button
              onClick={() => { setShowCredsModal(false); setCredsData(null); }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mt-4">Employee Account Provisioned!</h3>
              <p className="text-xs text-slate-500 mt-1">
                The profile for <span className="font-semibold text-slate-800">{credsData?.fullName}</span> has been logged. Use the generated credentials below for portal access.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase">Username (Email)</span>
                <span className="font-mono text-slate-800 font-semibold selection:bg-blue-100">{credsData?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-3">
                <span className="font-bold text-slate-400 uppercase flex items-center">
                  <Key className="h-3.5 w-3.5 mr-1" /> Password
                </span>
                <span className="font-mono text-slate-800 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-100 selection:bg-blue-100">
                  {credsData?.password}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => { setShowCredsModal(false); setCredsData(null); }}
                className="w-full rounded-lg bg-slate-900 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Dismiss Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-rose-50 p-3 text-rose-600 border border-rose-100 mb-2">
                <AlertCircle className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Delete Employee?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to permanently deactivate this employee account?
              </p>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setEmployeeIdToDelete(null); }}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 rounded-lg bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition-colors"
              >
                Delete Employee
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

export default EmployeeManagement;
