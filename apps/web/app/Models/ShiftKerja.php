<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftKerja extends Model
{
    protected $table = 'shift_kerja';

    protected $fillable = [
        'nama_shift',
        'jam_masuk',
        'jam_pulang',
        'jam_istirahat_mulai',
        'jam_istirahat_selesai',
        'late_tolerance_minutes',
    ];

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'id_shift');
    }
}
