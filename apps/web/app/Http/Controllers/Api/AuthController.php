<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAudit;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'nikOrEmail' => 'required|string',
            'password' => 'required|string',
        ]);

        $input = $request->input('nikOrEmail');
        $password = $request->input('password');

        $user = User::with(['role', 'karyawan.divisi', 'karyawan.jabatan', 'karyawan.shift'])
            ->where(function ($q) use ($input) {
                $q->where('nama_pengguna', $input)
                    ->orWhere('email', $input);
            })
            ->first();

        if (! $user) {
            return response()->json(['error' => 'Akun tidak ditemukan atau NIK/Email salah'], 401);
        }

        // Check password: first standard bcrypt, fallback to PBKDF2
        $isValid = Hash::check($password, $user->password);
        if (! $isValid && $user->kata_sandi_hash) {
            $pbkdf2 = hash_pbkdf2('sha256', $password.'nutrilife-salt-2026', 'nutrilife-salt-2026', 10000, 64);
            $isValid = hash_equals($user->kata_sandi_hash, $pbkdf2);
        }

        if (! $isValid) {
            return response()->json(['error' => 'Password tidak sesuai'], 401);
        }

        // Web session login
        Auth::login($user);

        // Sanctum token for API/mobile
        $token = $user->createToken('nutrilife_session')->plainTextToken;

        // Log audit
        LogAudit::create([
            'id_user' => $user->id,
            'tindakan' => 'USER_LOGIN',
            'modul' => 'AUTH',
            'deskripsi' => "{$user->name} ({$user->role?->nama_peran}) berhasil masuk ke sistem",
            'alamat_ip' => $request->ip(),
        ]);

        $karyawan = $user->karyawan;

        $userPayload = [
            'id' => (string) $user->id,
            'nik' => $user->nama_pengguna,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role?->nama_peran ?? 'EMPLOYEE',
            'division' => $karyawan?->divisi?->nama_divisi ?? 'OPERASIONAL',
            'jobPosition' => $karyawan?->jabatan?->nama_jabatan ?? 'Staff',
            'leaveQuota' => $karyawan?->sisa_kuota_cuti ?? 12,
        ];

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $userPayload,
        ])->cookie('nutrilife_session', $token, 60 * 24 * 7, '/', null, false, false);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            // Check session or token
            if (Auth::check()) {
                $user = Auth::user();
            }
        }

        if (! $user) {
            // Check cookie
            $cookieToken = $request->cookie('nutrilife_session');
            if ($cookieToken) {
                $tokenModel = PersonalAccessToken::findToken($cookieToken);
                if ($tokenModel) {
                    $user = $tokenModel->tokenable;
                }
            }
        }

        if (! $user) {
            // default fallback to first admin or 401
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user->loadMissing(['role', 'karyawan.divisi', 'karyawan.jabatan', 'karyawan.shift']);
        $karyawan = $user->karyawan;
        $shift = $karyawan?->shift;

        $shiftData = $shift ? [
            'id' => (string) $shift->id,
            'name' => $shift->nama_shift,
            'startTime' => $shift->jam_masuk,
            'endTime' => $shift->jam_pulang,
            'breakStartTime' => $shift->jam_istirahat_mulai,
            'breakEndTime' => $shift->jam_istirahat_selesai,
            'lateToleranceMinutes' => $shift->late_tolerance_minutes ?? 15,
        ] : [
            'id' => '1',
            'name' => 'Shift Reguler',
            'startTime' => '08:00',
            'endTime' => '17:00',
            'breakStartTime' => '12:00',
            'breakEndTime' => '13:00',
            'lateToleranceMinutes' => 15,
        ];

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'nik' => $user->nama_pengguna,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->nama_peran ?? 'EMPLOYEE',
                'division' => $karyawan?->divisi?->nama_divisi ?? 'OPERASIONAL',
                'jobPosition' => $karyawan?->jabatan?->nama_jabatan ?? 'Staff',
                'leaveQuota' => $karyawan?->sisa_kuota_cuti ?? 12,
                'shiftId' => (string) ($shift?->id ?? 1),
                'shift' => $shiftData,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if (Auth::check()) {
            Auth::logout();
        }
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout berhasil'])
            ->withoutCookie('nutrilife_session');
    }
}
