<?php

namespace App\Services;

class PayrollService
{
    /**
     * Hitung rincian gaji, tunjangan, potongan absensi, lembur, dan gaji bersih.
     */
    public static function calculatePayroll(array $input): array
    {
        $baseSalary = (float) ($input['baseSalary'] ?? 0);
        $allowance = (float) ($input['allowance'] ?? 0);
        $totalLateMinutes = (int) ($input['totalLateMinutes'] ?? 0);
        $totalAbsentDays = (int) ($input['totalAbsentDays'] ?? 0);
        $totalOvertimeMinutes = (int) ($input['totalOvertimeMinutes'] ?? 0);
        $workingDaysInMonth = (int) ($input['workingDaysInMonth'] ?? 22);

        // 1. Potongan Keterlambatan: Rp 1.000 per menit terlambat
        $lateDeduction = max(0, $totalLateMinutes * 1000);

        // 2. Potongan Alfa: Pro-rata harian (Gaji Pokok / total hari kerja)
        $dailyRate = $workingDaysInMonth > 0 ? $baseSalary / $workingDaysInMonth : 0;
        $absentDeduction = (float) round(max(0, $totalAbsentDays * $dailyRate));

        // 3. Upah Lembur: Standar PP 35/2021 (1.5x upah per jam = 1/173 x Gaji Pokok)
        $hourlyRate = $baseSalary / 173;
        $overtimeHours = $totalOvertimeMinutes / 60;
        $overtimePay = (float) round(max(0, $overtimeHours * 1.5 * $hourlyRate));

        // 4. Iuran BPJS & Pajak PPh21 estimasi (flat 4% dari gaji pokok)
        $taxAndBpjs = (float) round($baseSalary * 0.04);

        // 5. Gaji Bersih
        $gross = $baseSalary + $allowance + $overtimePay;
        $totalDeduction = $lateDeduction + $absentDeduction + $taxAndBpjs;
        $netSalary = (float) max(0, $gross - $totalDeduction);

        return [
            'baseSalary' => $baseSalary,
            'allowance' => $allowance,
            'lateDeduction' => (float) $lateDeduction,
            'absentDeduction' => $absentDeduction,
            'overtimePay' => $overtimePay,
            'taxAndBpjs' => $taxAndBpjs,
            'netSalary' => $netSalary,
        ];
    }
}
