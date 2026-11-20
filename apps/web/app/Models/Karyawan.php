<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Karyawan extends Model
{
    protected $table = 'karyawan';

    protected $fillable = [
        'id_user',
        'nip',
        'nama_lengkap',
        'id_divisi',
        'id_jabatan',
        'id_lokasi',
        'id_shift',
        'gaji_pokok',
        'tunjangan',
        'bonus',
        'sisa_kuota_cuti',
        'is_verified',
        'hr_eval_discipline',
        'hr_eval_performance',
        'hr_eval_score',
    ];

    protected function casts(): array
    {
        return [
            'gaji_pokok' => 'double',
            'tunjangan' => 'double',
            'bonus' => 'double',
            'sisa_kuota_cuti' => 'integer',
            'is_verified' => 'boolean',
            'hr_eval_score' => 'double',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function divisi(): BelongsTo
    {
        return $this->belongsTo(Divisi::class, 'id_divisi');
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'id_jabatan');
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(LokasiKantor::class, 'id_lokasi');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(ShiftKerja::class, 'id_shift');
    }

    public function presensi(): HasMany
    {
        return $this->hasMany(Presensi::class, 'id_karyawan');
    }

    public function pengajuanCuti(): HasMany
    {
        return $this->hasMany(PengajuanCutiIzin::class, 'id_karyawan');
    }

    public function penugasan(): HasMany
    {
        return $this->hasMany(Penugasan::class, 'ditugaskan_ke');
    }
}
