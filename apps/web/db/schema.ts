import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. TABEL ROLES
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaPeran: text("nama_peran").notNull().unique(),
  deskripsi: text("deskripsi"),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 2. TABEL USERS
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idRole: integer("id_role").notNull().references(() => roles.id, { onDelete: "restrict" }),
  namaPengguna: text("nama_pengguna").notNull().unique(),
  surel: text("surel").notNull().unique(),
  kataSandiHash: text("kata_sandi_hash").notNull(),
  apakahAktif: integer("apakah_aktif").default(1),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 3. TABEL DIVISI
export const divisi = sqliteTable("divisi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaDivisi: text("nama_divisi").notNull().unique(),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 4. TABEL JABATAN
export const jabatan = sqliteTable("jabatan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaJabatan: text("nama_jabatan").notNull().unique(),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 5. TABEL LOKASI_KANTOR
export const lokasiKantor = sqliteTable("lokasi_kantor", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaLokasi: text("nama_lokasi").notNull(),
  lintang: real("lintang").notNull(),
  bujur: real("bujur").notNull(),
  radiusMeter: integer("radius_meter").notNull().default(100),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 6. TABEL SHIFT_KERJA
export const shiftKerja = sqliteTable("shift_kerja", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaShift: text("nama_shift").notNull(),
  jamMasuk: text("jam_masuk").notNull(), // Format HH:MM:SS
  jamPulang: text("jam_pulang").notNull(),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 7. TABEL KARYAWAN
export const karyawan = sqliteTable("karyawan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idUser: integer("id_user").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  nip: text("nip").notNull().unique(),
  namaLengkap: text("nama_lengkap").notNull(),
  idDivisi: integer("id_divisi").notNull().references(() => divisi.id, { onDelete: "restrict" }),
  idJabatan: integer("id_jabatan").notNull().references(() => jabatan.id, { onDelete: "restrict" }),
  idLokasi: integer("id_lokasi").notNull().references(() => lokasiKantor.id, { onDelete: "restrict" }),
  idShift: integer("id_shift").notNull().references(() => shiftKerja.id, { onDelete: "restrict" }),
  gajiPokok: real("gaji_pokok").notNull().default(0.0),
  sisaKuotaCuti: integer("sisa_kuota_cuti").notNull().default(12),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 8. TABEL PRESENSI
export const presensi = sqliteTable("presensi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idKaryawan: integer("id_karyawan").notNull().references(() => karyawan.id, { onDelete: "cascade" }),
  idShift: integer("id_shift").notNull().references(() => shiftKerja.id, { onDelete: "restrict" }),
  tanggal: text("tanggal").notNull(), // Format YYYY-MM-DD
  waktuMasuk: text("waktu_masuk"),
  waktuPulang: text("waktu_pulang"),
  lintangMasuk: real("lintang_masuk"),
  bujurMasuk: real("bujur_masuk"),
  lintangPulang: real("lintang_pulang"),
  bujurPulang: real("bujur_pulang"),
  statusKehadiran: text("status_kehadiran").notNull().default("Hadir"),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
}, (table) => ({
  uniquePresensi: unique().on(table.idKaryawan, table.tanggal),
}));

// 9. TABEL PENGAJUAN_CUTI_IZIN
export const pengajuanCutiIzin = sqliteTable("pengajuan_cuti_izin", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idKaryawan: integer("id_karyawan").notNull().references(() => karyawan.id, { onDelete: "cascade" }),
  jenisPengajuan: text("jenis_pengajuan").notNull(),
  tanggalMulai: text("tanggal_mulai").notNull(),
  tanggalSelesai: text("tanggal_selesai").notNull(),
  alasan: text("alasan").notNull(),
  statusPersetujuan: text("status_persetujuan").notNull().default("Menunggu Approval GM"),
  disetujuiGmOleh: integer("disetujui_gm_oleh").references(() => users.id, { onDelete: "set null" }),
  waktuApprovalGm: text("waktu_approval_gm"),
  disetujuiHrOleh: integer("disetujui_hr_oleh").references(() => users.id, { onDelete: "set null" }),
  waktuApprovalHr: text("waktu_approval_hr"),
  catatanPenolakan: text("catatan_penolakan"),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
  diperbaruiPada: text("diperbarui_pada").default(sql`(datetime('now'))`),
});

// 10. TABEL PENGGAJIAN
export const penggajian = sqliteTable("penggajian", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idKaryawan: integer("id_karyawan").notNull().references(() => karyawan.id, { onDelete: "cascade" }),
  periodeBulan: integer("periode_bulan").notNull(),
  periodeTahun: integer("periode_tahun").notNull(),
  gajiPokok: real("gaji_pokok").notNull().default(0.0),
  tunjangan: real("tunjangan").notNull().default(0.0),
  upahLembur: real("upah_lembur").notNull().default(0.0),
  bonus: real("bonus").notNull().default(0.0),
  potonganKehadiran: real("potongan_kehadiran").notNull().default(0.0),
  potonganBpjs: real("potongan_bpjs").notNull().default(0.0),
  potonganPajak: real("potongan_pajak").notNull().default(0.0),
  gajiBersih: real("gaji_bersih").notNull().default(0.0),
  statusPembayaran: text("status_pembayaran").notNull().default("Draf"),
  diterbitkanPada: text("diterbitkan_pada").default(sql`(datetime('now'))`),
}, (table) => ({
  uniquePenggajian: unique().on(table.idKaryawan, table.periodeBulan, table.periodeTahun),
}));

// 11. TABEL LOG_AUDIT
export const logAudit = sqliteTable("log_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idUser: integer("id_user").references(() => users.id, { onDelete: "set null" }),
  tindakan: text("tindakan").notNull(),
  modul: text("modul").notNull(),
  deskripsi: text("deskripsi").notNull(),
  alamatIp: text("alamat_ip"),
  dibuatPada: text("dibuat_pada").default(sql`(datetime('now'))`),
});
