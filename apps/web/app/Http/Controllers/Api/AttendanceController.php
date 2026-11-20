<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\LokasiKantor;
use App\Models\Presensi;
use App\Models\ShiftKerja;
use App\Models\User;
use App\Services\GeofenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AttendanceController extends Controller
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

    public function checkIn(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photoDataUrlOrKey' => 'required|string',
        ]);

        $karyawan = $user->karyawan;
        if (! $karyawan) {
            return response()->json(['error' => 'Data karyawan tidak ditemukan'], 404);
        }

        $today = date('Y-m-d');
        $existing = Presensi::where('id_karyawan', $karyawan->id)
            ->where('tanggal', $today)
            ->first();

        if ($existing && $existing->waktu_masuk && $existing->waktu_masuk !== '-') {
            return response()->json(['error' => 'Anda sudah melakukan absensi masuk (check-in) hari ini'], 400);
        }

        $lat = (float) $request->input('latitude');
        $lng = (float) $request->input('longitude');
        $photo = $request->input('photoDataUrlOrKey');

        $activeOffice = LokasiKantor::where('is_active', true)->first();
        $officeLat = $activeOffice ? $activeOffice->lintang : -6.175392;
        $officeLng = $activeOffice ? $activeOffice->bujur : 106.827153;
        $radius = $activeOffice ? $activeOffice->radius_meter : 150;

        $geo = GeofenceService::isWithinRadius($lat, $lng, $officeLat, $officeLng, $radius);

        $shift = $karyawan->shift ?? ShiftKerja::first();
        $now = date('H:i:s');
        $shiftStart = $shift ? $shift->jam_masuk : '08:00';
        $lateTol = $shift ? ($shift->late_tolerance_minutes ?? 15) : 15;

        // Calculate late minutes
        $currentMin = (int) date('H') * 60 + (int) date('i');
        [$sh, $sm] = array_map('intval', explode(':', $shiftStart));
        $shiftMin = $sh * 60 + $sm;

        $lateMinutes = 0;
        $status = 'TEPAT_WAKTU';
        if ($currentMin > ($shiftMin + $lateTol)) {
            $status = 'TERLAMBAT';
            $lateMinutes = $currentMin - $shiftMin;
        }

        $presensi = Presensi::updateOrCreate(
            ['id_karyawan' => $karyawan->id, 'tanggal' => $today],
            [
                'id_shift' => $shift?->id,
                'waktu_masuk' => $now,
                'lintang_masuk' => $lat,
                'bujur_masuk' => $lng,
                'jarak_masuk_meter' => (int) $geo['distanceMeters'],
                'foto_masuk' => $photo,
                'status_kehadiran' => $status,
                'menit_terlambat' => $lateMinutes,
            ]
        );

        return response()->json([
            'message' => 'Absensi masuk berhasil dicatat',
            'attendance' => [
                'id' => (string) $presensi->id,
                'userId' => (string) $user->id,
                'userName' => $karyawan->nama_lengkap,
                'shiftId' => (string) ($shift?->id ?? 1),
                'shiftName' => $shift ? "{$shift->nama_shift} ({$shift->jam_masuk}-{$shift->jam_pulang})" : 'Shift Reguler',
                'date' => $today,
                'checkInTime' => $now,
                'checkInLat' => $lat,
                'checkInLng' => $lng,
                'checkInDistanceMeters' => (int) $geo['distanceMeters'],
                'checkInPhotoKey' => $photo,
                'checkOutTime' => $presensi->waktu_pulang ?? '-',
                'status' => $status,
                'lateMinutes' => $lateMinutes,
                'overtimeMinutes' => $presensi->menit_lembur ?? 0,
            ],
        ]);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $karyawan = $user->karyawan;
        if (! $karyawan) {
            return response()->json(['error' => 'Data karyawan tidak ditemukan'], 404);
        }

        $today = date('Y-m-d');
        $presensi = Presensi::where('id_karyawan', $karyawan->id)
            ->where('tanggal', $today)
            ->first();

        if (! $presensi || ! $presensi->waktu_masuk || $presensi->waktu_masuk === '-') {
            return response()->json(['error' => 'Anda belum melakukan absensi masuk (check-in) hari ini'], 400);
        }

        $lat = (float) $request->input('latitude', 0);
        $lng = (float) $request->input('longitude', 0);
        $photo = $request->input('photoDataUrlOrKey', '');

        $now = date('H:i:s');
        $shift = $karyawan->shift;
        $shiftEnd = $shift ? $shift->jam_pulang : '17:00';

        // Calculate overtime
        $currentMin = (int) date('H') * 60 + (int) date('i');
        [$eh, $em] = array_map('intval', explode(':', $shiftEnd));
        $shiftEndMin = $eh * 60 + $em;
        $overtimeMinutes = max(0, $currentMin - $shiftEndMin);

        $presensi->update([
            'waktu_pulang' => $now,
            'lintang_pulang' => $lat,
            'bujur_pulang' => $lng,
            'foto_pulang' => $photo,
            'menit_lembur' => $overtimeMinutes,
        ]);

        return response()->json([
            'message' => 'Absensi pulang berhasil dicatat',
            'attendance' => [
                'id' => (string) $presensi->id,
                'userId' => (string) $user->id,
                'userName' => $karyawan->nama_lengkap,
                'shiftId' => (string) ($shift?->id ?? 1),
                'shiftName' => $shift ? "{$shift->nama_shift} ({$shift->jam_masuk}-{$shift->jam_pulang})" : 'Shift Reguler',
                'date' => $today,
                'checkInTime' => $presensi->waktu_masuk,
                'checkOutTime' => $now,
                'checkOutLat' => $lat,
                'checkOutLng' => $lng,
                'checkOutPhotoKey' => $photo,
                'status' => $presensi->status_kehadiran,
                'lateMinutes' => $presensi->menit_terlambat,
                'overtimeMinutes' => $overtimeMinutes,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $query = Presensi::with(['karyawan.user.role', 'shift'])->orderBy('tanggal', 'desc');

        $role = $user->role?->nama_peran ?? 'EMPLOYEE';

        if ($role === 'EMPLOYEE') {
            $karyawan = $user->karyawan;
            if ($karyawan) {
                $query->where('id_karyawan', $karyawan->id);
            }
        } elseif ($role === 'GM') {
            // GM monitors regular employees (role EMPLOYEE = 5)
            $query->whereHas('karyawan.user', function ($q) {
                $q->where('id_role', 5);
            });
        }

        $records = $query->get()->map(function ($p) {
            $shift = $p->shift;
            $karyawan = $p->karyawan;

            return [
                'id' => (string) $p->id,
                'userId' => (string) ($karyawan?->id_user ?? $p->id_karyawan),
                'userName' => $karyawan?->nama_lengkap ?? 'Karyawan',
                'shiftId' => (string) ($p->id_shift ?? 1),
                'shiftName' => $shift ? "{$shift->nama_shift} ({$shift->jam_masuk}-{$shift->jam_pulang})" : 'Shift Reguler',
                'date' => $p->tanggal,
                'checkInTime' => $p->waktu_masuk ?? '-',
                'checkInLat' => $p->lintang_masuk ?? -6.175392,
                'checkInLng' => $p->bujur_masuk ?? 106.827153,
                'checkInDistanceMeters' => $p->jarak_masuk_meter ?? 0,
                'checkInPhotoKey' => $p->foto_masuk ?? '',
                'checkOutTime' => $p->waktu_pulang ?? '-',
                'checkOutLat' => $p->lintang_pulang,
                'checkOutLng' => $p->bujur_pulang,
                'checkOutPhotoKey' => $p->foto_pulang ?? '',
                'status' => $p->status_kehadiran,
                'lateMinutes' => $p->menit_terlambat ?? 0,
                'overtimeMinutes' => $p->menit_lembur ?? 0,
                'createdAt' => $p->created_at?->timestamp * 1000 ?? time() * 1000,
            ];
        });

        return response()->json([
            'attendances' => $records,
            'total' => $records->count(),
        ]);
    }

    public function patchHistory(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'userId' => 'required',
            'date' => 'required|string',
            'status' => 'required|string',
        ]);

        $targetUser = User::find($request->input('userId'));
        $karyawan = $targetUser?->karyawan ?? Karyawan::where('id_user', $request->input('userId'))->first();

        if (! $karyawan) {
            return response()->json(['error' => 'Karyawan tidak valid'], 400);
        }

        $date = $request->input('date');
        $status = $request->input('status');
        $checkInTime = $request->input('checkInTime', '-');
        $checkOutTime = $request->input('checkOutTime', '-');

        $shift = $karyawan->shift ?? ShiftKerja::first();

        $lateMinutes = 0;
        if ($status === 'TERLAMBAT' && $checkInTime && $checkInTime !== '-') {
            [$ih, $im] = array_map('intval', explode(':', $checkInTime));
            [$sh, $sm] = array_map('intval', explode(':', $shift->jam_masuk ?? '08:00'));
            $lateMinutes = max(0, ($ih * 60 + $im) - ($sh * 60 + $sm));
        }

        $presensi = Presensi::updateOrCreate(
            ['id_karyawan' => $karyawan->id, 'tanggal' => $date],
            [
                'id_shift' => $shift?->id,
                'waktu_masuk' => $checkInTime,
                'waktu_pulang' => $checkOutTime,
                'status_kehadiran' => $status,
                'menit_terlambat' => $lateMinutes,
            ]
        );

        return response()->json([
            'message' => 'Data presensi berhasil diperbarui',
            'attendance' => $presensi,
        ]);
    }
}
