<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\PengajuanCutiIzin;
use App\Models\Penggajian;
use App\Models\Presensi;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function slip(Request $request): JsonResponse
    {
        $slips = Penggajian::with(['karyawan.divisi', 'karyawan.user'])
            ->orderBy('periode_tahun', 'desc')
            ->orderBy('periode_bulan', 'desc')
            ->get()
            ->map(function ($s) {
                $k = $s->karyawan;

                return [
                    'id' => (string) $s->id,
                    'userId' => (string) ($k?->id_user ?? $s->id_karyawan),
                    'userName' => $k?->nama_lengkap ?? 'Karyawan',
                    'userNik' => $k?->nip ?? '-',
                    'userDivision' => $k?->divisi?->nama_divisi ?? 'OPERASIONAL',
                    'month' => $s->periode_bulan,
                    'year' => $s->periode_tahun,
                    'baseSalary' => (float) $s->gaji_pokok,
                    'allowance' => (float) $s->tunjangan,
                    'bonus' => (float) $s->bonus,
                    'lateDeduction' => (float) $s->potongan_kehadiran,
                    'absentDeduction' => 0.0,
                    'overtimePay' => (float) $s->upah_lembur,
                    'bpjsDeduction' => (float) $s->potongan_bpjs,
                    'taxDeduction' => (float) $s->potongan_pajak,
                    'taxAndBpjs' => (float) ($s->potongan_bpjs + $s->potongan_pajak),
                    'netSalary' => (float) $s->gaji_bersih,
                    'status' => $s->status_pembayaran,
                    'generatedAt' => strtotime($s->diterbitkan_pada ?? now()) * 1000,
                ];
            });

        return response()->json(['slips' => $slips]);
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|integer',
            'year' => 'required|integer',
        ]);

        $month = (int) $request->input('month');
        $year = (int) $request->input('year');

        // Only employees (role = 5)
        $employees = Karyawan::whereHas('user', function ($q) {
            $q->where('id_role', 5);
        })->get();

        $count = 0;
        $generatedSlips = [];

        foreach ($employees as $emp) {
            $monthStr = sprintf('%04d-%02d', $year, $month);

            $attendances = Presensi::where('id_karyawan', $emp->id)
                ->where('tanggal', 'like', "{$monthStr}%")
                ->whereIn('status_kehadiran', ['TEPAT_WAKTU', 'TERLAMBAT'])
                ->get();

            $totalLate = $attendances->sum('menit_terlambat');
            $totalOvertime = $attendances->sum('menit_lembur');
            $presentDays = $attendances->count();

            $approvedLeaves = PengajuanCutiIzin::where('id_karyawan', $emp->id)
                ->where('status_persetujuan', 'FINAL_DISETUJUI')
                ->where('tanggal_mulai', 'like', "{$monthStr}%")
                ->sum('durasi_hari');

            $absentDays = max(0, 22 - ($presentDays + $approvedLeaves));

            $calc = PayrollService::calculatePayroll([
                'baseSalary' => $emp->gaji_pokok,
                'allowance' => $emp->tunjangan,
                'totalLateMinutes' => $totalLate,
                'totalAbsentDays' => $absentDays,
                'totalOvertimeMinutes' => $totalOvertime,
                'workingDaysInMonth' => 22,
            ]);

            $bpjs = round($emp->gaji_pokok * 0.02);
            $tax = max(0, $calc['taxAndBpjs'] - $bpjs);
            $netSalary = $calc['netSalary'] + $emp->bonus;

            $slip = Penggajian::updateOrCreate(
                [
                    'id_karyawan' => $emp->id,
                    'periode_bulan' => $month,
                    'periode_tahun' => $year,
                ],
                [
                    'gaji_pokok' => $emp->gaji_pokok,
                    'tunjangan' => $emp->tunjangan,
                    'upah_lembur' => $calc['overtimePay'],
                    'bonus' => $emp->bonus,
                    'potongan_kehadiran' => $calc['lateDeduction'] + $calc['absentDeduction'],
                    'potongan_bpjs' => $bpjs,
                    'potongan_pajak' => $tax,
                    'gaji_bersih' => $netSalary,
                    'status_pembayaran' => 'PUBLISHED',
                    'diterbitkan_pada' => date('Y-m-d H:i:s'),
                ]
            );

            $count++;
            $generatedSlips[] = $slip;
        }

        return response()->json([
            'message' => "Payroll periode {$month}/{$year} berhasil digenerate untuk {$count} karyawan",
            'count' => $count,
            'slips' => $generatedSlips,
        ]);
    }
}
