-- Migration 0004: Buat tabel penugasan untuk delegasi tugas GM
CREATE TABLE IF NOT EXISTS penugasan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    dibuat_oleh INTEGER NOT NULL,
    ditugaskan_ke INTEGER NOT NULL,
    prioritas TEXT NOT NULL DEFAULT 'SEDANG',
    status TEXT NOT NULL DEFAULT 'PENDING',
    tenggat_waktu TEXT NOT NULL,
    catatan_penyelesaian TEXT,
    catatan_revisi TEXT,
    dibuat_pada TEXT DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dibuat_oleh) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (ditugaskan_ke) REFERENCES karyawan (id) ON DELETE CASCADE
);

-- Indexing untuk query performa
CREATE INDEX IF NOT EXISTS idx_penugasan_ditugaskan_ke ON penugasan(ditugaskan_ke);
CREATE INDEX IF NOT EXISTS idx_penugasan_status ON penugasan(status);
