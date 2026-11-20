<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Divisi extends Model
{
    protected $table = 'divisi';

    protected $fillable = [
        'nama_divisi',
    ];

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'id_divisi');
    }
}
