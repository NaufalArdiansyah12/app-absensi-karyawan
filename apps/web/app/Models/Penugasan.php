<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penugasan extends Model
{
    protected $table = 'penugasan';

    protected $fillable = [
        'judul',
        'deskripsi',
        'dibuat_oleh',
        'ditugaskan_ke',
        'prioritas',
        'status',
        'tenggat_waktu',
        'catatan_penyelesaian',
        'catatan_revisi',
    ];

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function penerima(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'ditugaskan_ke');
    }
}
