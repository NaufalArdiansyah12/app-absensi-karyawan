<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penggajian extends Model
{
    protected $table = 'penggajian';

    protected $fillable = [
        'id_karyawan',
        'periode_bulan',
        'periode_tahun',
        'gaji_pokok',
        'tunjangan',
        'upah_lembur',
        'bonus',
        'potongan_kehadiran',
        'potongan_bpjs',
        'potongan_pajak',
        'gaji_bersih',
        'status_pembayaran',
        'diterbitkan_pada',
    ];

    protected function casts(): array
    {
        return [
            'periode_bulan' => 'integer',
            'periode_tahun' => 'integer',
            'gaji_pokok' => 'double',
            'tunjangan' => 'double',
            'upah_lembur' => 'double',
            'bonus' => 'double',
            'potongan_kehadiran' => 'double',
            'potongan_bpjs' => 'double',
            'potongan_pajak' => 'double',
            'gaji_bersih' => 'double',
        ];
    }

    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }
}
