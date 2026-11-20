<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\Jabatan;
use App\Models\Karyawan;
use App\Models\LokasiKantor;
use App\Models\PengajuanCutiIzin;
use App\Models\Penugasan;
use App\Models\Presensi;
use App\Models\Role;
use App\Models\ShiftKerja;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['id' => 1, 'nama_peran' => 'SUPER_USER', 'deskripsi' => 'Akses penuh konfigurasi sistem'],
            ['id' => 2, 'nama_peran' => 'GM', 'deskripsi' => 'General Manager, approval cuti tahap 1'],
            ['id' => 3, 'nama_peran' => 'HR', 'deskripsi' => 'Human Resources, approval cuti final dan verifikasi absensi'],
            ['id' => 4, 'nama_peran' => 'FINANCE', 'deskripsi' => 'Finance officer, kalkulasi payroll dan gaji'],
            ['id' => 5, 'nama_peran' => 'EMPLOYEE', 'deskripsi' => 'Karyawan mandiri mobile'],
        ];
        foreach ($roles as $r) {
            Role::updateOrCreate(['id' => $r['id']], $r);
        }

        // 2. Divisi
        $divisiList = [
            ['id' => 1, 'nama_divisi' => 'OPERASIONAL'],
            ['id' => 2, 'nama_divisi' => 'HR'],
            ['id' => 3, 'nama_divisi' => 'FINANCE'],
            ['id' => 4, 'nama_divisi' => 'IT'],
            ['id' => 5, 'nama_divisi' => 'LOGISTIK'],
            ['id' => 6, 'nama_divisi' => 'PRODUKSI'],
            ['id' => 7, 'nama_divisi' => 'MARKETING'],
        ];
        foreach ($divisiList as $d) {
            Divisi::updateOrCreate(['id' => $d['id']], $d);
        }

        // 3. Jabatan
        $jabatanList = [
            ['id' => 1, 'nama_jabatan' => 'System Administrator'],
            ['id' => 2, 'nama_jabatan' => 'General Manager'],
            ['id' => 3, 'nama_jabatan' => 'HR Specialist'],
            ['id' => 4, 'nama_jabatan' => 'Finance Officer'],
            ['id' => 5, 'nama_jabatan' => 'Staff Operasional'],
            ['id' => 6, 'nama_jabatan' => 'Staff Gudang'],
            ['id' => 7, 'nama_jabatan' => 'Teknisi Mesin'],
            ['id' => 8, 'nama_jabatan' => 'Quality Control'],
            ['id' => 9, 'nama_jabatan' => 'Kurir Ekspedisi'],
            ['id' => 10, 'nama_jabatan' => 'Frontend Engineer'],
            ['id' => 11, 'nama_jabatan' => 'Staff Gudang Senior'],
            ['id' => 12, 'nama_jabatan' => 'Social Media Specialist'],
            ['id' => 13, 'nama_jabatan' => 'Operator Mesin'],
            ['id' => 14, 'nama_jabatan' => 'Content Creator'],
        ];
        foreach ($jabatanList as $j) {
            Jabatan::updateOrCreate(['id' => $j['id']], $j);
        }

        // 4. Lokasi Kantor
        $lokasi = LokasiKantor::updateOrCreate(
            ['id' => 1],
            [
                'nama_lokasi' => 'Kantor Pusat Nutrilife (Jakarta)',
                'lintang' => -6.175392,
                'bujur' => 106.827153,
                'radius_meter' => 150,
                'is_active' => true,
            ]
        );

        // 5. Shift Kerja
        $shifts = [
            [
                'id' => 1,
                'nama_shift' => 'Shift Reguler',
                'jam_masuk' => '08:00',
                'jam_pulang' => '17:00',
                'jam_istirahat_mulai' => '12:00',
                'jam_istirahat_selesai' => '13:00',
                'late_tolerance_minutes' => 15,
            ],
            [
                'id' => 2,
                'nama_shift' => 'Shift Pagi',
                'jam_masuk' => '07:00',
                'jam_pulang' => '13:00',
                'jam_istirahat_mulai' => '10:00',
                'jam_istirahat_selesai' => '10:30',
                'late_tolerance_minutes' => 15,
            ],
            [
                'id' => 3,
                'nama_shift' => 'Shift Siang',
                'jam_masuk' => '13:00',
                'jam_pulang' => '21:00',
                'jam_istirahat_mulai' => '16:30',
                'jam_istirahat_selesai' => '17:30',
                'late_tolerance_minutes' => 15,
            ],
        ];
        foreach ($shifts as $s) {
            ShiftKerja::updateOrCreate(['id' => $s['id']], $s);
        }

        // PBKDF2 hashes for compat
        $adminPbkdf2 = hash_pbkdf2('sha256', 'admin123'.'nutrilife-salt-2026', 'nutrilife-salt-2026', 10000, 64);
        $empPbkdf2 = hash_pbkdf2('sha256', 'karyawan123'.'nutrilife-salt-2026', 'nutrilife-salt-2026', 10000, 64);

        // 6. Users & Karyawan
        $usersData = [
            [
                'id' => 1,
                'id_role' => 1,
                'nama_pengguna' => 'SU001',
                'name' => 'Admin Super User',
                'email' => 'superuser@nutrilife.com',
                'password' => Hash::make('admin123'),
                'kata_sandi_hash' => $adminPbkdf2,
                'nip' => 'SU001',
                'id_divisi' => 4,
                'id_jabatan' => 1,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 12000000,
                'tunjangan' => 1000000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
            ],
            [
                'id' => 2,
                'id_role' => 2,
                'nama_pengguna' => 'GM001',
                'name' => 'Budi Santoso (GM)',
                'email' => 'gm@nutrilife.com',
                'password' => Hash::make('admin123'),
                'kata_sandi_hash' => $adminPbkdf2,
                'nip' => 'GM001',
                'id_divisi' => 1,
                'id_jabatan' => 2,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 15000000,
                'tunjangan' => 2000000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
            ],
            [
                'id' => 3,
                'id_role' => 3,
                'nama_pengguna' => 'HR001',
                'name' => 'Siti Rahma (HR)',
                'email' => 'hr@nutrilife.com',
                'password' => Hash::make('admin123'),
                'kata_sandi_hash' => $adminPbkdf2,
                'nip' => 'HR001',
                'id_divisi' => 2,
                'id_jabatan' => 3,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 8000000,
                'tunjangan' => 1000000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
            ],
            [
                'id' => 4,
                'id_role' => 4,
                'nama_pengguna' => 'FN001',
                'name' => 'Dewi Lestari (Finance)',
                'email' => 'finance@nutrilife.com',
                'password' => Hash::make('admin123'),
                'kata_sandi_hash' => $adminPbkdf2,
                'nip' => 'FN001',
                'id_divisi' => 3,
                'id_jabatan' => 4,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 8500000,
                'tunjangan' => 1200000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
            ],
            [
                'id' => 5,
                'id_role' => 5,
                'nama_pengguna' => 'EMP001',
                'name' => 'Ahmad Fauzi',
                'email' => 'karyawan@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP001',
                'id_divisi' => 1,
                'id_jabatan' => 5,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 6000000,
                'tunjangan' => 500000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
                'hr_eval_discipline' => 'Kehadiran disiplin dan konsisten.',
                'hr_eval_score' => 92,
                'hr_eval_performance' => 'Target operasional harian tercapai dengan sangat baik.',
            ],
            [
                'id' => 6,
                'id_role' => 5,
                'nama_pengguna' => 'EMP002',
                'name' => 'Rian Pratama',
                'email' => 'rian@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP002',
                'id_divisi' => 5,
                'id_jabatan' => 6,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 5500000,
                'tunjangan' => 400000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 10,
                'is_verified' => true,
                'hr_eval_discipline' => 'Perlu memperhatikan ketepatan waktu check-in.',
                'hr_eval_score' => 78,
                'hr_eval_performance' => 'Pengelolaan inventaris gudang rapi dan akurat.',
            ],
            [
                'id' => 7,
                'id_role' => 5,
                'nama_pengguna' => 'EMP003',
                'name' => 'Bima Sakti',
                'email' => 'bima.sakti@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP003',
                'id_divisi' => 6,
                'id_jabatan' => 7,
                'id_lokasi' => 1,
                'id_shift' => 2,
                'gaji_pokok' => 6200000,
                'tunjangan' => 600000,
                'bonus' => 250000,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
            ],
            [
                'id' => 8,
                'id_role' => 5,
                'nama_pengguna' => 'EMP004',
                'name' => 'Dinda Permata',
                'email' => 'dinda.permata@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP004',
                'id_divisi' => 1,
                'id_jabatan' => 8,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 5800000,
                'tunjangan' => 500000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 11,
                'is_verified' => true,
            ],
            [
                'id' => 9,
                'id_role' => 5,
                'nama_pengguna' => 'EMP005',
                'name' => 'Eko Wahyudi',
                'email' => 'eko.wahyudi@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP005',
                'id_divisi' => 5,
                'id_jabatan' => 9,
                'id_lokasi' => 1,
                'id_shift' => 3,
                'gaji_pokok' => 5200000,
                'tunjangan' => 700000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 9,
                'is_verified' => false,
                'hr_eval_discipline' => 'Teguran lisan: beberapa kali terlambat check-in shift siang.',
                'hr_eval_score' => 68,
                'hr_eval_performance' => 'Distribusi barang selesai namun perlu efisiensi rute pengantaran.',
            ],
            [
                'id' => 10,
                'id_role' => 5,
                'nama_pengguna' => 'EMP006',
                'name' => 'Fitri Handayani',
                'email' => 'fitri.handayani@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP006',
                'id_divisi' => 4,
                'id_jabatan' => 10,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 8500000,
                'tunjangan' => 1000000,
                'bonus' => 500000,
                'sisa_kuota_cuti' => 12,
                'is_verified' => true,
                'hr_eval_discipline' => 'Kehadiran prima dan selalu tepat waktu.',
                'hr_eval_score' => 96,
                'hr_eval_performance' => 'Pengembangan web dashboard absensi HR dan mobile sangat cepat.',
            ],
            [
                'id' => 11,
                'id_role' => 5,
                'nama_pengguna' => 'EMP007',
                'name' => 'Gilang Ramadhan',
                'email' => 'gilang.ramadhan@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP007',
                'id_divisi' => 6,
                'id_jabatan' => 11,
                'id_lokasi' => 1,
                'id_shift' => 2,
                'gaji_pokok' => 6000000,
                'tunjangan' => 500000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 8,
                'is_verified' => true,
            ],
            [
                'id' => 12,
                'id_role' => 5,
                'nama_pengguna' => 'EMP008',
                'name' => 'Hani Anggraini',
                'email' => 'hani.anggraini@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP008',
                'id_divisi' => 7,
                'id_jabatan' => 12,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 5900000,
                'tunjangan' => 450000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 12,
                'is_verified' => false,
            ],
            [
                'id' => 13,
                'id_role' => 5,
                'nama_pengguna' => 'EMP009',
                'name' => 'Indra Kusuma',
                'email' => 'indra.kusuma@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP009',
                'id_divisi' => 6,
                'id_jabatan' => 13,
                'id_lokasi' => 1,
                'id_shift' => 3,
                'gaji_pokok' => 5400000,
                'tunjangan' => 500000,
                'bonus' => 0,
                'sisa_kuota_cuti' => 7,
                'is_verified' => false,
            ],
            [
                'id' => 14,
                'id_role' => 5,
                'nama_pengguna' => 'EMP010',
                'name' => 'Jessica Tan',
                'email' => 'jessica.tan@nutrilife.com',
                'password' => Hash::make('karyawan123'),
                'kata_sandi_hash' => $empPbkdf2,
                'nip' => 'EMP010',
                'id_divisi' => 7,
                'id_jabatan' => 14,
                'id_lokasi' => 1,
                'id_shift' => 1,
                'gaji_pokok' => 6500000,
                'tunjangan' => 600000,
                'bonus' => 300000,
                'sisa_kuota_cuti' => 14,
                'is_verified' => true,
            ],
        ];

        foreach ($usersData as $ud) {
            $user = User::updateOrCreate(
                ['id' => $ud['id']],
                [
                    'id_role' => $ud['id_role'],
                    'nama_pengguna' => $ud['nama_pengguna'],
                    'name' => $ud['name'],
                    'email' => $ud['email'],
                    'password' => $ud['password'],
                    'kata_sandi_hash' => $ud['kata_sandi_hash'],
                    'apakah_aktif' => true,
                ]
            );

            Karyawan::updateOrCreate(
                ['id_user' => $user->id],
                [
                    'nip' => $ud['nip'],
                    'nama_lengkap' => $ud['name'],
                    'id_divisi' => $ud['id_divisi'],
                    'id_jabatan' => $ud['id_jabatan'],
                    'id_lokasi' => $ud['id_lokasi'],
                    'id_shift' => $ud['id_shift'],
                    'gaji_pokok' => $ud['gaji_pokok'],
                    'tunjangan' => $ud['tunjangan'],
                    'bonus' => $ud['bonus'],
                    'sisa_kuota_cuti' => $ud['sisa_kuota_cuti'],
                    'is_verified' => $ud['is_verified'],
                    'hr_eval_discipline' => $ud['hr_eval_discipline'] ?? null,
                    'hr_eval_score' => $ud['hr_eval_score'] ?? null,
                    'hr_eval_performance' => $ud['hr_eval_performance'] ?? null,
                ]
            );
        }

        // 7. Presensi Data (Sample)
        $today = date('Y-m-d');
        $d1 = date('Y-m-d', strtotime('-1 day'));
        $d2 = date('Y-m-d', strtotime('-2 days'));

        $karyawans = Karyawan::all()->keyBy('nip');

        // 7. Presensi dikosongkan (tanpa sampel otomatis)
        $sampleAttendances = [];

        foreach ($sampleAttendances as $sa) {
            if (isset($karyawans[$sa['nip']])) {
                $k = $karyawans[$sa['nip']];
                Presensi::updateOrCreate(
                    ['id_karyawan' => $k->id, 'tanggal' => $sa['tanggal']],
                    [
                        'id_shift' => $k->id_shift,
                        'waktu_masuk' => $sa['waktu_masuk'],
                        'waktu_pulang' => $sa['waktu_pulang'],
                        'lintang_masuk' => -6.175392,
                        'bujur_masuk' => 106.827153,
                        'jarak_masuk_meter' => 5,
                        'status_kehadiran' => $sa['status_kehadiran'],
                        'menit_terlambat' => $sa['menit_terlambat'],
                        'menit_lembur' => 0,
                    ]
                );
            }
        }

        // 8. Sample Leaves
        if (isset($karyawans['EMP004'])) {
            PengajuanCutiIzin::updateOrCreate(
                ['id_karyawan' => $karyawans['EMP004']->id, 'tanggal_mulai' => $d2],
                [
                    'jenis_pengajuan' => 'CUTI_TAHUNAN',
                    'tanggal_selesai' => $d1,
                    'durasi_hari' => 2,
                    'alasan' => 'Keperluan keluarga di luar kota',
                    'status_persetujuan' => 'MENUNGGU_GM',
                ]
            );
        }

        if (isset($karyawans['EMP007'])) {
            PengajuanCutiIzin::updateOrCreate(
                ['id_karyawan' => $karyawans['EMP007']->id, 'tanggal_mulai' => $today],
                [
                    'jenis_pengajuan' => 'IZIN_SAKIT',
                    'tanggal_selesai' => $today,
                    'durasi_hari' => 1,
                    'alasan' => 'Demam dan flu berat, istirahat dokter',
                    'status_persetujuan' => 'MENUNGGU_HR',
                    'disetujui_gm_oleh' => 2,
                    'waktu_approval_gm' => date('Y-m-d H:i:s'),
                ]
            );
        }

        // 9. Sample Penugasan
        if (isset($karyawans['EMP006'])) {
            Penugasan::updateOrCreate(
                ['judul' => 'Pengembangan Modul Absensi HR'],
                [
                    'deskripsi' => 'Pastikan flow approval cuti 2 tingkat sinkron antara GM dan HR.',
                    'dibuat_oleh' => 2,
                    'ditugaskan_ke' => $karyawans['EMP006']->id,
                    'prioritas' => 'TINGGI',
                    'status' => 'IN_PROGRESS',
                    'tenggat_waktu' => date('Y-m-d', strtotime('+7 days')),
                ]
            );
        }
    }
}
