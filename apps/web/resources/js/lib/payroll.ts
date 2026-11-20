export interface PayrollCalculationInput {
  baseSalary: number;
  allowance: number;
  totalLateMinutes: number;
  totalAbsentDays: number;
  totalOvertimeMinutes: number;
  workingDaysInMonth?: number;
}

export interface PayrollResult {
  baseSalary: number;
  allowance: number;
  lateDeduction: number;
  absentDeduction: number;
  overtimePay: number;
  taxAndBpjs: number;
  netSalary: number;
}

/**
 * Hitung rincian gaji, tunjangan, potongan absensi, lembur, dan gaji bersih.
 */
export function calculatePayroll(input: PayrollCalculationInput): PayrollResult {
  const {
    baseSalary,
    allowance,
    totalLateMinutes,
    totalAbsentDays,
    totalOvertimeMinutes,
    workingDaysInMonth = 22,
  } = input;

  const lateDeduction = Math.max(0, totalLateMinutes * 1000);
  const dailyRate = workingDaysInMonth > 0 ? baseSalary / workingDaysInMonth : 0;
  const absentDeduction = Math.round(Math.max(0, totalAbsentDays * dailyRate));
  const hourlyRate = baseSalary / 173;
  const overtimeHours = totalOvertimeMinutes / 60;
  const overtimePay = Math.round(Math.max(0, overtimeHours * 1.5 * hourlyRate));
  const taxAndBpjs = Math.round(baseSalary * 0.04);

  const gross = baseSalary + allowance + overtimePay;
  const totalDeduction = lateDeduction + absentDeduction + taxAndBpjs;
  const netSalary = Math.max(0, gross - totalDeduction);

  return {
    baseSalary,
    allowance,
    lateDeduction,
    absentDeduction,
    overtimePay,
    taxAndBpjs,
    netSalary,
  };
}
