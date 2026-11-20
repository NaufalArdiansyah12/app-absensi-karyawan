<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('divisi', function (Blueprint $table) {
            $table->id();
            $table->string('nama_divisi', 100)->unique();
            $table->timestamps();
        });

        Schema::create('jabatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jabatan', 100)->unique();
            $table->timestamps();
        });

        Schema::create('lokasi_kantor', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lokasi', 150);
            $table->double('lintang');
            $table->double('bujur');
            $table->integer('radius_meter')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shift_kerja', function (Blueprint $table) {
            $table->id();
            $table->string('nama_shift', 100);
            $table->string('jam_masuk', 10);
            $table->string('jam_pulang', 10);
            $table->string('jam_istirahat_mulai', 10)->default('12:00:00');
            $table->string('jam_istirahat_selesai', 10)->default('13:00:00');
            $table->integer('late_tolerance_minutes')->default(0);
            $table->timestamps();
        });

        Schema::create('karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nip', 50)->unique();
            $table->string('nama_lengkap', 150);
            $table->foreignId('id_divisi')->constrained('divisi')->onDelete('restrict');
            $table->foreignId('id_jabatan')->constrained('jabatan')->onDelete('restrict');
            $table->foreignId('id_lokasi')->constrained('lokasi_kantor')->onDelete('restrict');
            $table->foreignId('id_shift')->constrained('shift_kerja')->onDelete('restrict');
            $table->double('gaji_pokok')->default(0.0);
            $table->double('tunjangan')->default(750000.0);
            $table->double('bonus')->default(0.0);
            $table->integer('sisa_kuota_cuti')->default(12);
            $table->boolean('is_verified')->default(true);
            $table->text('hr_eval_discipline')->nullable();
            $table->text('hr_eval_performance')->nullable();
            $table->double('hr_eval_score')->nullable();
            $table->timestamps();
        });

        Schema::create('presensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_karyawan')->constrained('karyawan')->cascadeOnDelete();
            $table->foreignId('id_shift')->nullable()->constrained('shift_kerja')->onDelete('restrict');
            $table->string('tanggal', 12);
            $table->string('waktu_masuk', 10)->nullable();
            $table->string('waktu_pulang', 10)->nullable();
            $table->double('lintang_masuk')->nullable();
            $table->double('bujur_masuk')->nullable();
            $table->integer('jarak_masuk_meter')->nullable();
            $table->text('foto_masuk')->nullable();
            $table->double('lintang_pulang')->nullable();
            $table->double('bujur_pulang')->nullable();
            $table->text('foto_pulang')->nullable();
            $table->string('status_kehadiran', 50)->default('Hadir');
            $table->integer('menit_terlambat')->default(0);
            $table->integer('menit_lembur')->default(0);
            $table->timestamps();

            $table->unique(['id_karyawan', 'tanggal']);
        });

        Schema::create('pengajuan_cuti_izin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_karyawan')->constrained('karyawan')->cascadeOnDelete();
            $table->string('jenis_pengajuan', 50);
            $table->string('tanggal_mulai', 12);
            $table->string('tanggal_selesai', 12);
            $table->integer('durasi_hari')->default(1);
            $table->text('alasan');
            $table->text('doc_key')->nullable();
            $table->string('status_persetujuan', 50)->default('MENUNGGU_GM');
            $table->foreignId('disetujui_gm_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->string('waktu_approval_gm', 30)->nullable();
            $table->text('catatan_gm')->nullable();
            $table->foreignId('disetujui_hr_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->string('waktu_approval_hr', 30)->nullable();
            $table->text('catatan_hr')->nullable();
            $table->text('catatan_penolakan')->nullable();
            $table->timestamps();
        });

        Schema::create('penggajian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_karyawan')->constrained('karyawan')->cascadeOnDelete();
            $table->integer('periode_bulan');
            $table->integer('periode_tahun');
            $table->double('gaji_pokok')->default(0.0);
            $table->double('tunjangan')->default(0.0);
            $table->double('upah_lembur')->default(0.0);
            $table->double('bonus')->default(0.0);
            $table->double('potongan_kehadiran')->default(0.0);
            $table->double('potongan_bpjs')->default(0.0);
            $table->double('potongan_pajak')->default(0.0);
            $table->double('gaji_bersih')->default(0.0);
            $table->string('status_pembayaran', 50)->default('DRAFT');
            $table->string('diterbitkan_pada', 30)->nullable();
            $table->timestamps();

            $table->unique(['id_karyawan', 'periode_bulan', 'periode_tahun']);
        });

        Schema::create('log_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tindakan', 100);
            $table->string('modul', 100);
            $table->text('deskripsi');
            $table->string('alamat_ip', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('penugasan', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 255);
            $table->text('deskripsi');
            $table->foreignId('dibuat_oleh')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ditugaskan_ke')->constrained('karyawan')->cascadeOnDelete();
            $table->string('prioritas', 20)->default('SEDANG');
            $table->string('status', 20)->default('PENDING');
            $table->string('tenggat_waktu', 12);
            $table->text('catatan_penyelesaian')->nullable();
            $table->text('catatan_revisi')->nullable();
            $table->timestamps();

            $table->index('ditugaskan_ke');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penugasan');
        Schema::dropIfExists('log_audit');
        Schema::dropIfExists('penggajian');
        Schema::dropIfExists('pengajuan_cuti_izin');
        Schema::dropIfExists('presensi');
        Schema::dropIfExists('karyawan');
        Schema::dropIfExists('shift_kerja');
        Schema::dropIfExists('lokasi_kantor');
        Schema::dropIfExists('jabatan');
        Schema::dropIfExists('divisi');
    }
};
