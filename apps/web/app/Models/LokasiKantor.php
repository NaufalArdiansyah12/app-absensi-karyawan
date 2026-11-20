<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LokasiKantor extends Model
{
    protected $table = 'lokasi_kantor';

    protected $fillable = [
        'nama_lokasi',
        'lintang',
        'bujur',
        'radius_meter',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lintang' => 'double',
            'bujur' => 'double',
            'radius_meter' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'id_lokasi');
    }
}
