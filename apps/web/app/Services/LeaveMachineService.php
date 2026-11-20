<?php

namespace App\Services;

use Exception;

class LeaveMachineService
{
    /**
     * State machine untuk alur persetujuan cuti berjenjang (GM -> HR).
     */
    public static function transitionLeaveStatus(
        string $currentStatus,
        string $role,
        string $action
    ): array {
        if ($role === 'GM') {
            if ($currentStatus !== 'MENUNGGU_GM') {
                throw new Exception("GM hanya dapat memproses status MENUNGGU_GM. Status saat ini: {$currentStatus}");
            }

            return [
                'nextStatus' => $action === 'APPROVE' ? 'MENUNGGU_HR' : 'DITOLAK_GM',
                'canDeductQuota' => false,
            ];
        }

        if ($role === 'HR') {
            if ($currentStatus !== 'MENUNGGU_HR') {
                throw new Exception("HR hanya dapat memproses status MENUNGGU_HR. Status saat ini: {$currentStatus}");
            }

            return [
                'nextStatus' => $action === 'APPROVE' ? 'FINAL_DISETUJUI' : 'DITOLAK_HR',
                'canDeductQuota' => $action === 'APPROVE',
            ];
        }

        throw new Exception("Role {$role} tidak berwenang melakukan persetujuan cuti.");
    }

    /**
     * Validasi dan kurangi kuota cuti tahunan.
     */
    public static function deductLeaveQuota(
        int $currentQuota,
        int $durationDays,
        string $leaveType
    ): int {
        if ($leaveType !== 'CUTI_TAHUNAN') {
            return $currentQuota;
        }
        if ($durationDays <= 0) {
            throw new Exception('Durasi cuti harus lebih besar dari 0.');
        }
        if ($currentQuota < $durationDays) {
            throw new Exception("Saldo cuti tidak mencukupi. Kuota tersisa: {$currentQuota}, diajukan: {$durationDays}");
        }

        return $currentQuota - $durationDays;
    }
}
