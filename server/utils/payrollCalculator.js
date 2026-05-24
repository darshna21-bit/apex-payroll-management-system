/**
 * Reusable utility to compute Net Salary.
 * Ensures no negative values are returned.
 */
const calculateNetSalary = (structure = {}) => {
  const baseSalary = Number(structure.baseSalary) || 0;
  const allowances = Number(structure.allowances) || 0;
  const bonus = Number(structure.bonus) || 0;
  const pfDeduction = Number(structure.pfDeduction) || 0;
  const taxDeduction = Number(structure.taxDeduction) || 0;
  const otherDeductions = Number(structure.otherDeductions) || 0;

  const grossSalary = baseSalary + allowances + bonus;
  const totalDeductions = pfDeduction + taxDeduction + otherDeductions;
  
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    baseSalary,
    allowances,
    bonus,
    pfDeduction,
    taxDeduction,
    otherDeductions,
    grossSalary,
    totalDeductions,
    netSalary: Math.round(netSalary * 100) / 100, // round to 2 decimal places
  };
};

module.exports = { calculateNetSalary };
