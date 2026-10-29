-- Aktifkan Foreign Key di SQLite
PRAGMA foreign_keys = ON;

-- 1. TABEL ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_peran TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now'))
);

-- 2. TABEL USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_role INTEGER NOT NULL,
    nama_pengguna TEXT NOT NULL UNIQUE,
    surel TEXT NOT NULL UNIQUE,
    kata_sandi_hash TEXT NOT NULL,
    apakah_aktif INTEGER DEFAULT 1,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_role) REFERENCES roles (id) ON DELETE RESTRICT
);

-- 3. TABEL DIVISI
CREATE TABLE IF NOT EXISTS divisi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_divisi TEXT NOT NULL UNIQUE,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now'))
);

-- 4. TABEL JABATAN
CREATE TABLE IF NOT EXISTS jabatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_jabatan TEXT NOT NULL UNIQUE,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now'))
);

-- 5. TABEL LOKASI_KANTOR
CREATE TABLE IF NOT EXISTS lokasi_kantor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lokasi TEXT NOT NULL,
    lintang REAL NOT NULL,
    bujur REAL NOT NULL,
    radius_meter INTEGER NOT NULL DEFAULT 100,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now'))
);

-- 6. TABEL SHIFT_KERJA
CREATE TABLE IF NOT EXISTS shift_kerja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_shift TEXT NOT NULL,
    jam_masuk TEXT NOT NULL, -- Format HH:MM:SS
    jam_pulang TEXT NOT NULL,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now'))
);

-- 7. TABEL KARYAWAN
CREATE TABLE IF NOT EXISTS karyawan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL UNIQUE,
    nip TEXT NOT NULL UNIQUE,
    nama_lengkap TEXT NOT NULL,
    id_divisi INTEGER NOT NULL,
    id_jabatan INTEGER NOT NULL,
    id_lokasi INTEGER NOT NULL,
    id_shift INTEGER NOT NULL,
    gaji_pokok REAL NOT NULL DEFAULT 0.0,
    sisa_kuota_cuti INTEGER NOT NULL DEFAULT 12,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (id_divisi) REFERENCES divisi (id) ON DELETE RESTRICT,
    FOREIGN KEY (id_jabatan) REFERENCES jabatan (id) ON DELETE RESTRICT,
    FOREIGN KEY (id_lokasi) REFERENCES lokasi_kantor (id) ON DELETE RESTRICT,
    FOREIGN KEY (id_shift) REFERENCES shift_kerja (id) ON DELETE RESTRICT
);

-- 8. TABEL PRESENSI
CREATE TABLE IF NOT EXISTS presensi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan INTEGER NOT NULL,
    id_shift INTEGER NOT NULL,
    tanggal TEXT NOT NULL, -- Format YYYY-MM-DD
    waktu_masuk TEXT,
    waktu_pulang TEXT,
    lintang_masuk REAL,
    bujur_masuk REAL,
    lintang_pulang REAL,
    bujur_pulang REAL,
    status_kehadiran TEXT NOT NULL DEFAULT 'Hadir',
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_karyawan) REFERENCES karyawan (id) ON DELETE CASCADE,
    FOREIGN KEY (id_shift) REFERENCES shift_kerja (id) ON DELETE RESTRICT,
    UNIQUE (id_karyawan, tanggal)
);

-- 9. TABEL PENGAJUAN_CUTI_IZIN
CREATE TABLE IF NOT EXISTS pengajuan_cuti_izin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan INTEGER NOT NULL,
    jenis_pengajuan TEXT NOT NULL,
    tanggal_mulai TEXT NOT NULL,
    tanggal_selesai TEXT NOT NULL,
    alasan TEXT NOT NULL,
    status_persetujuan TEXT NOT NULL DEFAULT 'Menunggu Approval GM',
    disetujui_gm_oleh INTEGER,
    waktu_approval_gm TEXT,
    disetujui_hr_oleh INTEGER,
    waktu_approval_hr TEXT,
    catatan_penolakan TEXT,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    diperbarui_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_karyawan) REFERENCES karyawan (id) ON DELETE CASCADE,
    FOREIGN KEY (disetujui_gm_oleh) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (disetujui_hr_oleh) REFERENCES users (id) ON DELETE SET NULL
);

-- 10. TABEL PENGGAJIAN
CREATE TABLE IF NOT EXISTS penggajian (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan INTEGER NOT NULL,
    periode_bulan INTEGER NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
    periode_tahun INTEGER NOT NULL,
    gaji_pokok REAL NOT NULL DEFAULT 0.0,
    tunjangan REAL NOT NULL DEFAULT 0.0,
    upah_lembur REAL NOT NULL DEFAULT 0.0,
    bonus REAL NOT NULL DEFAULT 0.0,
    potongan_kehadiran REAL NOT NULL DEFAULT 0.0,
    potongan_bpjs REAL NOT NULL DEFAULT 0.0,
    potongan_pajak REAL NOT NULL DEFAULT 0.0,
    gaji_bersih REAL NOT NULL DEFAULT 0.0,
    status_pembayaran TEXT NOT NULL DEFAULT 'Draf',
    diterbitkan_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_karyawan) REFERENCES karyawan (id) ON DELETE CASCADE,
    UNIQUE (id_karyawan, periode_bulan, periode_tahun)
);

-- 11. TABEL LOG_AUDIT
CREATE TABLE IF NOT EXISTS log_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER,
    tindakan TEXT NOT NULL,
    modul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    alamat_ip TEXT,
    dibuat_pada TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE SET NULL
);
