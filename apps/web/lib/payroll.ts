export interface PayrollCalculationInput {
  baseSalary: number;
  allowance: number;
  totalLateMinutes: number;
  totalAbsentDays: number;
  totalOvertimeMinutes: number;
  workingDaysInMonth?: number; // default 22
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

  // 1. Potongan Keterlambatan: Rp 1.000 per menit terlambat
  const lateDeduction = Math.max(0, totalLateMinutes * 1000);

  // 2. Potongan Alfa: Pro-rata harian (Gaji Pokok / total hari kerja)
  const dailyRate = workingDaysInMonth > 0 ? baseSalary / workingDaysInMonth : 0;
  const absentDeduction = Math.round(Math.max(0, totalAbsentDays * dailyRate));

  // 3. Upah Lembur: Standar PP 35/2021 (1.5x upah per jam = 1/173 x Gaji Pokok)
  const hourlyRate = baseSalary / 173;
  const overtimeHours = totalOvertimeMinutes / 60;
  const overtimePay = Math.round(Math.max(0, overtimeHours * 1.5 * hourlyRate));

  // 4. Iuran BPJS & Pajak PPh21 estimasi (flat 4% dari gaji pokok)
  const taxAndBpjs = Math.round(baseSalary * 0.04);

  // 5. Gaji Bersih
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
