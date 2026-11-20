<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth Routes
Route::get('/', function () {
    return redirect()->route('login');
});

// Super User routes
Route::get('/dashboard', function () {
    $user = auth()->user();
    if (! $user) {
        return redirect()->route('login');
    }

    $roleName = $user->role?->nama_peran;

    return match ($roleName) {
        'SUPER_USER' => redirect()->route('super-user.index'),
        'GM' => redirect()->route('gm.dashboard'),
        'HR' => redirect()->route('hr.dashboard'),
        'FINANCE' => redirect()->route('finance.dashboard'),
        default => redirect()->route('gm.dashboard'),
    };
})->middleware(['auth'])->name('dashboard');

Route::prefix('super-user')->group(function () {
    Route::get('/', function () {
        return Inertia::render('SuperUser/Index');
    })->name('super-user.index');
});

// General Manager (GM) routes
Route::prefix('gm')->group(function () {
    Route::get('/', function () {
        return Inertia::render('GM/Dashboard');
    })->name('gm.dashboard');

    Route::get('/absensi', function () {
        return Inertia::render('GM/Absensi');
    })->name('gm.absensi');

    Route::get('/cuti', function () {
        return Inertia::render('GM/Cuti');
    })->name('gm.cuti');

    Route::get('/izin', function () {
        return Inertia::render('GM/Izin');
    })->name('gm.izin');

    Route::get('/karyawan', function () {
        return Inertia::render('GM/Karyawan');
    })->name('gm.karyawan');

    Route::get('/kedisiplinan', function () {
        return Inertia::render('GM/Kedisiplinan');
    })->name('gm.kedisiplinan');

    Route::get('/laporan', function () {
        return Inertia::render('GM/Laporan');
    })->name('gm.laporan');

    Route::get('/penugasan', function () {
        return Inertia::render('GM/Penugasan');
    })->name('gm.penugasan');

    Route::get('/perusahaan', function () {
        return Inertia::render('GM/Perusahaan');
    })->name('gm.perusahaan');
});

// Human Resources (HR) routes
Route::prefix('hr')->group(function () {
    Route::get('/', function () {
        return Inertia::render('HR/Dashboard');
    })->name('hr.dashboard');

    Route::get('/absensi', function () {
        return Inertia::render('HR/Absensi');
    })->name('hr.absensi');

    Route::get('/approval', function () {
        return Inertia::render('HR/Approval');
    })->name('hr.approval');

    Route::get('/cuti', function () {
        return Inertia::render('HR/Cuti');
    })->name('hr.cuti');

    Route::get('/izin', function () {
        return Inertia::render('HR/Izin');
    })->name('hr.izin');

    Route::get('/karyawan', function () {
        return Inertia::render('HR/Karyawan');
    })->name('hr.karyawan');

    Route::get('/kedisiplinan', function () {
        return Inertia::render('HR/Kedisiplinan');
    })->name('hr.kedisiplinan');

    Route::get('/keterlambatan', function () {
        return Inertia::render('HR/Keterlambatan');
    })->name('hr.keterlambatan');

    Route::get('/evaluasi-kedisiplinan', function () {
        return Inertia::render('HR/EvaluasiKedisiplinan');
    })->name('hr.evaluasi-kedisiplinan');

    Route::get('/evaluasi-kinerja', function () {
        return Inertia::render('HR/EvaluasiKinerja');
    })->name('hr.evaluasi-kinerja');

    Route::get('/laporan', function () {
        return Inertia::render('HR/Laporan');
    })->name('hr.laporan');

    Route::get('/perusahaan', function () {
        return Inertia::render('HR/Perusahaan');
    })->name('hr.perusahaan');
});

// Finance routes
Route::prefix('finance')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Finance/Dashboard');
    })->name('finance.dashboard');

    Route::get('/perhitungan', function () {
        return Inertia::render('Finance/Perhitungan');
    })->name('finance.perhitungan');

    Route::get('/gaji-pokok', function () {
        return Inertia::render('Finance/GajiPokok');
    })->name('finance.gaji-pokok');

    Route::get('/tunjangan', function () {
        return Inertia::render('Finance/Tunjangan');
    })->name('finance.tunjangan');

    Route::get('/potongan', function () {
        return Inertia::render('Finance/Potongan');
    })->name('finance.potongan');

    Route::get('/lembur', function () {
        return Inertia::render('Finance/Lembur');
    })->name('finance.lembur');

    Route::get('/bonus', function () {
        return Inertia::render('Finance/Bonus');
    })->name('finance.bonus');

    Route::get('/bpjs', function () {
        return Inertia::render('Finance/Bpjs');
    })->name('finance.bpjs');

    Route::get('/pajak', function () {
        return Inertia::render('Finance/Pajak');
    })->name('finance.pajak');

    Route::get('/slip-gaji', function () {
        return Inertia::render('Finance/SlipGaji');
    })->name('finance.slip-gaji');

    Route::get('/rekap', function () {
        return Inertia::render('Finance/Rekap');
    })->name('finance.rekap');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
