<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAudit;
use App\Models\PengajuanCutiIzin;
use App\Models\User;
use App\Services\LeaveMachineService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class LeaveController extends Controller
{
    private function resolveAuthUser(Request $request): ?User
    {
        $user = $request->user();
        if ($user) {
            return $user;
        }
        if (Auth::check()) {
            return Auth::user();
        }
        $cookieToken = $request->cookie('nutrilife_session');
        if ($cookieToken) {
            $tokenModel = PersonalAccessToken::findToken($cookieToken);
            if ($tokenModel) {
                return $tokenModel->tokenable;
            }
        }

        return null;
    }

    public function pending(Request $request): JsonResponse
    {
        $leaves = PengajuanCutiIzin::with(['karyawan.divisi', 'karyawan.user'])
            ->whereIn('status_persetujuan', ['MENUNGGU_GM', 'MENUNGGU_HR'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($l) {
                return [
                    'id' => (string) $l->id,
                    'userId' => (string) ($l->karyawan?->id_user ?? $l->id_karyawan),
                    'userName' => $l->karyawan?->nama_lengkap ?? 'Karyawan',
                    'userDivision' => $l->karyawan?->divisi?->nama_divisi ?? 'OPERASIONAL',
                    'type' => $l->jenis_pengajuan,
                    'startDate' => $l->tanggal_mulai,
                    'endDate' => $l->tanggal_selesai,
                    'durationDays' => $l->durasi_hari,
                    'reason' => $l->alasan,
                    'docKey' => $l->doc_key,
                    'status' => $l->status_persetujuan,
                    'gmNote' => $l->catatan_gm,
                    'hrNote' => $l->catatan_hr,
                    'createdAt' => $l->created_at?->timestamp * 1000 ?? time() * 1000,
                ];
            });

        return response()->json([
            'pendingLeaves' => $leaves,
            'total' => $leaves->count(),
        ]);
    }

    public function myLeaves(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $karyawan = $user->karyawan;
        if (! $karyawan) {
            return response()->json(['leaves' => [], 'total' => 0]);
        }

        $leaves = PengajuanCutiIzin::where('id_karyawan', $karyawan->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($l) use ($user, $karyawan) {
                return [
                    'id' => (string) $l->id,
                    'userId' => (string) $user->id,
                    'userName' => $karyawan->nama_lengkap,
                    'userDivision' => $karyawan->divisi?->nama_divisi ?? 'OPERASIONAL',
                    'type' => $l->jenis_pengajuan,
                    'startDate' => $l->tanggal_mulai,
                    'endDate' => $l->tanggal_selesai,
                    'durationDays' => $l->durasi_hari,
                    'reason' => $l->alasan,
                    'docKey' => $l->doc_key,
                    'status' => $l->status_persetujuan,
                    'gmNote' => $l->catatan_gm,
                    'hrNote' => $l->catatan_hr,
                    'createdAt' => $l->created_at?->timestamp * 1000 ?? time() * 1000,
                ];
            });

        return response()->json([
            'leaves' => $leaves,
            'total' => $leaves->count(),
        ]);
    }

    public function apply(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'type' => 'required|string',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'durationDays' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $karyawan = $user->karyawan;
        if (! $karyawan) {
            return response()->json(['error' => 'Data karyawan tidak ditemukan'], 404);
        }

        $type = $request->input('type');
        $durationDays = (int) $request->input('durationDays');

        if ($type === 'CUTI_TAHUNAN' && $karyawan->sisa_kuota_cuti < $durationDays) {
            return response()->json([
                'error' => "Saldo cuti tahunan tidak mencukupi (sisa: {$karyawan->sisa_kuota_cuti} hari)",
            ], 400);
        }

        $leave = PengajuanCutiIzin::create([
            'id_karyawan' => $karyawan->id,
            'jenis_pengajuan' => $type,
            'tanggal_mulai' => $request->input('startDate'),
            'tanggal_selesai' => $request->input('endDate'),
            'durasi_hari' => $durationDays,
            'alasan' => $request->input('reason'),
            'doc_key' => $request->input('docKey'),
            'status_persetujuan' => 'MENUNGGU_GM',
        ]);

        LogAudit::create([
            'id_user' => $user->id,
            'tindakan' => 'LEAVE_APPLY',
            'modul' => 'CUTI',
            'deskripsi' => "{$user->name} mengajukan cuti {$type} selama {$durationDays} hari",
            'alamat_ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Pengajuan cuti berhasil dikirim, menunggu approval GM',
            'leave' => $leave,
        ]);
    }

    public function approveGm(Request $request, $id): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $leave = PengajuanCutiIzin::with('karyawan')->find($id);
        if (! $leave) {
            return response()->json(['error' => 'Pengajuan cuti tidak ditemukan'], 404);
        }

        $action = $request->input('action');
        if (! $action) {
            $approved = filter_var($request->input('approved', true), FILTER_VALIDATE_BOOLEAN);
            $action = $approved ? 'APPROVE' : 'REJECT';
        }
        $note = $request->input('note', '');

        try {
            $trans = LeaveMachineService::transitionLeaveStatus(
                $leave->status_persetujuan,
                'GM',
                $action
            );

            $leave->update([
                'status_persetujuan' => $trans['nextStatus'],
                'disetujui_gm_oleh' => $user->id,
                'waktu_approval_gm' => date('Y-m-d H:i:s'),
                'catatan_gm' => $note,
            ]);

            return response()->json([
                'message' => $approved ? 'Approval GM berhasil. Menunggu approval HR.' : 'Pengajuan cuti ditolak oleh GM.',
                'leave' => $leave,
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function approveHr(Request $request, $id): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $leave = PengajuanCutiIzin::with('karyawan')->find($id);
        if (! $leave) {
            return response()->json(['error' => 'Pengajuan cuti tidak ditemukan'], 404);
        }

        $action = $request->input('action');
        if (! $action) {
            $approved = filter_var($request->input('approved', true), FILTER_VALIDATE_BOOLEAN);
            $action = $approved ? 'APPROVE' : 'REJECT';
        }
        $note = $request->input('note', '');

        try {
            $trans = LeaveMachineService::transitionLeaveStatus(
                $leave->status_persetujuan,
                'HR',
                $action
            );

            $leave->update([
                'status_persetujuan' => $trans['nextStatus'],
                'disetujui_hr_oleh' => $user->id,
                'waktu_approval_hr' => date('Y-m-d H:i:s'),
                'catatan_hr' => $note,
            ]);

            // Deduct quota if approved annual leave
            if ($trans['canDeductQuota'] && $leave->jenis_pengajuan === 'CUTI_TAHUNAN' && $leave->karyawan) {
                $karyawan = $leave->karyawan;
                $newQuota = LeaveMachineService::deductLeaveQuota(
                    $karyawan->sisa_kuota_cuti,
                    $leave->durasi_hari,
                    $leave->jenis_pengajuan
                );
                $karyawan->update(['sisa_kuota_cuti' => $newQuota]);
            }

            return response()->json([
                'message' => $approved ? 'Approval HR berhasil. Cuti telah disetujui final.' : 'Pengajuan cuti ditolak oleh HR.',
                'leave' => $leave,
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
