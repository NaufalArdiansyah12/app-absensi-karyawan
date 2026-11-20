<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presensi extends Model
{
    protected $table = 'presensi';

    protected $fillable = [
        'id_karyawan',
        'id_shift',
        'tanggal',
        'waktu_masuk',
        'waktu_pulang',
        'lintang_masuk',
        'bujur_masuk',
        'jarak_masuk_meter',
        'foto_masuk',
        'lintang_pulang',
        'bujur_pulang',
        'foto_pulang',
        'status_kehadiran',
        'menit_terlambat',
        'menit_lembur',
    ];

    protected function casts(): array
    {
        return [
            'lintang_masuk' => 'double',
            'bujur_masuk' => 'double',
            'lintang_pulang' => 'double',
            'bujur_pulang' => 'double',
            'jarak_masuk_meter' => 'integer',
            'menit_terlambat' => 'integer',
            'menit_lembur' => 'integer',
        ];
    }

    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(ShiftKerja::class, 'id_shift');
    }
}
