-- Tambah kolom waktu istirahat pada tabel shift_kerja
ALTER TABLE shift_kerja ADD COLUMN jam_istirahat_mulai TEXT DEFAULT '12:00:00';
ALTER TABLE shift_kerja ADD COLUMN jam_istirahat_selesai TEXT DEFAULT '13:00:00';

-- Update default istirahat untuk Shift Reguler dan tambah preset Shift Pagi & Shift Siang
UPDATE shift_kerja SET jam_istirahat_mulai = '12:00:00', jam_istirahat_selesai = '13:00:00' WHERE id = 1;

INSERT OR IGNORE INTO shift_kerja (id, nama_shift, jam_masuk, jam_pulang, jam_istirahat_mulai, jam_istirahat_selesai) VALUES
(2, 'Shift Pagi', '07:00:00', '13:00:00', '10:00:00', '10:30:00'),
(3, 'Shift Siang', '13:00:00', '21:00:00', '16:30:00', '17:30:00');
