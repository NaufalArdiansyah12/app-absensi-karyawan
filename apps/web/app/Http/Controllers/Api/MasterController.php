<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAudit;
use App\Models\LokasiKantor;
use App\Models\ShiftKerja;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::with(['role', 'karyawan.divisi', 'karyawan.jabatan', 'karyawan.shift'])
            ->get()
            ->map(function ($u) {
                $k = $u->karyawan;

                return [
                    'id' => (string) $u->id,
                    'nik' => $u->nama_pengguna,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role?->nama_peran ?? 'EMPLOYEE',
                    'division' => $k?->divisi?->nama_divisi ?? 'OPERASIONAL',
                    'jobPosition' => $k?->jabatan?->nama_jabatan ?? 'Staff',
                    'shiftId' => (string) ($k?->id_shift ?? 1),
                    'baseSalary' => (float) ($k?->gaji_pokok ?? 0),
                    'allowance' => (float) ($k?->tunjangan ?? 750000),
                    'bonus' => (float) ($k?->bonus ?? 0),
                    'leaveQuota' => (int) ($k?->sisa_kuota_cuti ?? 12),
                    'isVerified' => (bool) ($k?->is_verified ?? true),
                    'hrEvalDiscipline' => $k?->hr_eval_discipline,
                    'hrEvalPerformance' => $k?->hr_eval_performance,
                    'hrEvalScore' => $k?->hr_eval_score,
                    'createdAt' => $u->created_at?->timestamp * 1000 ?? time() * 1000,
                ];
            });

        return response()->json(['users' => $users]);
    }

    public function patchUser(Request $request): JsonResponse
    {
        $userId = $request->input('id');
        $user = User::with('karyawan')->find($userId);
        if (! $user || ! $user->karyawan) {
            return response()->json(['error' => 'Karyawan tidak ditemukan'], 404);
        }

        $karyawan = $user->karyawan;
        $karyawanData = [];

        if ($request->has('baseSalary')) {
            $karyawanData['gaji_pokok'] = (float) $request->input('baseSalary');
        }
        if ($request->has('allowance')) {
            $karyawanData['tunjangan'] = (float) $request->input('allowance');
        }
        if ($request->has('bonus')) {
            $karyawanData['bonus'] = (float) $request->input('bonus');
        }
        if ($request->has('leaveQuota')) {
            $karyawanData['sisa_kuota_cuti'] = (int) $request->input('leaveQuota');
        }
        if ($request->has('isVerified')) {
            $karyawanData['is_verified'] = (bool) $request->input('isVerified');
        }
        if ($request->has('hrEvalDiscipline')) {
            $karyawanData['hr_eval_discipline'] = $request->input('hrEvalDiscipline');
        }
        if ($request->has('hrEvalPerformance')) {
            $karyawanData['hr_eval_performance'] = $request->input('hrEvalPerformance');
        }
        if ($request->has('hrEvalScore')) {
            $karyawanData['hr_eval_score'] = (float) $request->input('hrEvalScore');
        }
        if ($request->has('shiftId')) {
            $karyawanData['id_shift'] = (int) $request->input('shiftId');
        }

        $karyawan->update($karyawanData);

        return response()->json(['message' => 'Data karyawan berhasil diperbarui']);
    }

    public function shifts(): JsonResponse
    {
        $shifts = ShiftKerja::all()->map(function ($s) {
            return [
                'id' => (string) $s->id,
                'name' => $s->nama_shift,
                'startTime' => $s->jam_masuk,
                'endTime' => $s->jam_pulang,
                'breakStartTime' => $s->jam_istirahat_mulai,
                'breakEndTime' => $s->jam_istirahat_selesai,
                'lateToleranceMinutes' => $s->late_tolerance_minutes ?? 15,
            ];
        });

        return response()->json(['shifts' => $shifts]);
    }

    public function updateShift(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $shift = ShiftKerja::find($id);
        if (! $shift) {
            return response()->json(['error' => 'Shift tidak ditemukan'], 404);
        }

        $shift->update([
            'nama_shift' => $request->input('name', $shift->nama_shift),
            'jam_masuk' => $request->input('startTime', $shift->jam_masuk),
            'jam_pulang' => $request->input('endTime', $shift->jam_pulang),
            'jam_istirahat_mulai' => $request->input('breakStartTime', $shift->jam_istirahat_mulai),
            'jam_istirahat_selesai' => $request->input('breakEndTime', $shift->jam_istirahat_selesai),
            'late_tolerance_minutes' => (int) $request->input('lateToleranceMinutes', $shift->late_tolerance_minutes),
        ]);

        return response()->json(['message' => 'Shift berhasil diperbarui', 'shift' => $shift]);
    }

    public function offices(): JsonResponse
    {
        $offices = LokasiKantor::all()->map(function ($o) {
            return [
                'id' => (string) $o->id,
                'name' => $o->nama_lokasi,
                'latitude' => (float) $o->lintang,
                'longitude' => (float) $o->bujur,
                'radiusMeters' => (int) $o->radius_meter,
                'isActive' => (bool) $o->is_active,
            ];
        });

        return response()->json(['offices' => $offices]);
    }

    public function updateOffice(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $office = LokasiKantor::find($id);
        if (! $office) {
            return response()->json(['error' => 'Lokasi kantor tidak ditemukan'], 404);
        }

        $office->update([
            'nama_lokasi' => $request->input('name', $office->nama_lokasi),
            'lintang' => (float) $request->input('latitude', $office->lintang),
            'bujur' => (float) $request->input('longitude', $office->bujur),
            'radius_meter' => (int) $request->input('radiusMeters', $office->radius_meter),
            'is_active' => (bool) $request->input('isActive', $office->is_active),
        ]);

        return response()->json(['message' => 'Lokasi kantor berhasil diperbarui', 'office' => $office]);
    }

    public function auditLogs(): JsonResponse
    {
        $logs = LogAudit::with('user')->orderBy('id', 'desc')->take(50)->get()->map(function ($l) {
            return [
                'id' => (string) $l->id,
                'userId' => (string) $l->id_user,
                'userName' => $l->user?->name ?? 'System',
                'action' => $l->tindakan,
                'module' => $l->modul,
                'details' => $l->deskripsi,
                'ip' => $l->alamat_ip,
                'createdAt' => $l->created_at?->timestamp * 1000 ?? time() * 1000,
            ];
        });

        return response()->json(['auditLogs' => $logs]);
    }
}
