-- Seed 1. Roles
INSERT OR IGNORE INTO roles (id, nama_peran, deskripsi) VALUES
(1, 'SUPER_USER', 'Akses penuh konfigurasi sistem'),
(2, 'GM', 'General Manager, approval cuti tahap 1'),
(3, 'HR', 'Human Resources, approval cuti final dan verifikasi absensi'),
(4, 'FINANCE', 'Finance officer, kalkulasi payroll dan gaji'),
(5, 'KARYAWAN', 'Karyawan mandiri mobile');

-- Seed 2. Divisi
INSERT OR IGNORE INTO divisi (id, nama_divisi) VALUES
(1, 'OPERASIONAL'),
(2, 'HR'),
(3, 'FINANCE'),
(4, 'IT');

-- Seed 3. Jabatan
INSERT OR IGNORE INTO jabatan (id, nama_jabatan) VALUES
(1, 'System Administrator'),
(2, 'General Manager'),
(3, 'HR Specialist'),
(4, 'Finance Officer'),
(5, 'Staff Operasional'),
(6, 'Staff Gudang');

-- Seed 4. Lokasi Kantor
INSERT OR IGNORE INTO lokasi_kantor (id, nama_lokasi, lintang, bujur, radius_meter) VALUES
(1, 'Kantor Pusat Nutrilife', -6.175392, 106.827153, 150);

-- Seed 5. Shift Kerja
INSERT OR IGNORE INTO shift_kerja (id, nama_shift, jam_masuk, jam_pulang) VALUES
(1, 'Shift Reguler', '08:00:00', '17:00:00');

-- Seed 6. Users (default pass: admin123 / karyawan123 - hashed)
INSERT OR IGNORE INTO users (id, id_role, nama_pengguna, surel, kata_sandi_hash, apakah_aktif) VALUES
(1, 1, 'SU001', 'superuser@nutrilife.com', '7dc2808b0f80bcff37fa0566378e718ae1d622f6d0f81d8977a49ba8ad49cf7a', 1),
(2, 2, 'GM001', 'gm@nutrilife.com', '7dc2808b0f80bcff37fa0566378e718ae1d622f6d0f81d8977a49ba8ad49cf7a', 1),
(3, 3, 'HR001', 'hr@nutrilife.com', '7dc2808b0f80bcff37fa0566378e718ae1d622f6d0f81d8977a49ba8ad49cf7a', 1),
(4, 4, 'FN001', 'finance@nutrilife.com', '7dc2808b0f80bcff37fa0566378e718ae1d622f6d0f81d8977a49ba8ad49cf7a', 1),
(5, 5, 'EMP001', 'karyawan@nutrilife.com', '5722421319c5c0d12e617d7b1a646cba309f4007886b71f9cfd05b8104ec033b', 1),
(6, 5, 'EMP002', 'rian@nutrilife.com', '5722421319c5c0d12e617d7b1a646cba309f4007886b71f9cfd05b8104ec033b', 1);

-- Seed 7. Karyawan
INSERT OR IGNORE INTO karyawan (id, id_user, nip, nama_lengkap, id_divisi, id_jabatan, id_lokasi, id_shift, gaji_pokok, sisa_kuota_cuti) VALUES
(1, 1, 'SU001', 'Admin Super User', 4, 1, 1, 1, 12000000.0, 12),
(2, 2, 'GM001', 'Budi Santoso (GM)', 1, 2, 1, 1, 15000000.0, 12),
(3, 3, 'HR001', 'Siti Rahma (HR)', 2, 3, 1, 1, 8000000.0, 12),
(4, 4, 'FN001', 'Dewi Lestari (Finance)', 3, 4, 1, 1, 8500000.0, 12),
(5, 5, 'EMP001', 'Ahmad Fauzi', 1, 5, 1, 1, 6000000.0, 12),
(6, 6, 'EMP002', 'Rian Pratama', 1, 6, 1, 1, 5500000.0, 10);
