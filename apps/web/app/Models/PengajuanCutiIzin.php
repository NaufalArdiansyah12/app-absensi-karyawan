<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengajuanCutiIzin extends Model
{
    protected $table = 'pengajuan_cuti_izin';

    protected $fillable = [
        'id_karyawan',
        'jenis_pengajuan',
        'tanggal_mulai',
        'tanggal_selesai',
        'durasi_hari',
        'alasan',
        'doc_key',
        'status_persetujuan',
        'disetujui_gm_oleh',
        'waktu_approval_gm',
        'catatan_gm',
        'disetujui_hr_oleh',
        'waktu_approval_hr',
        'catatan_hr',
        'catatan_penolakan',
    ];

    protected function casts(): array
    {
        return [
            'durasi_hari' => 'integer',
        ];
    }

    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }

    public function disetujuiGm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_gm_oleh');
    }

    public function disetujuiHr(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_hr_oleh');
    }
}
