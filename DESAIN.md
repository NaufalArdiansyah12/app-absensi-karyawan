---
name: Sistem Desain Aplikasi Absensi dan Payroll Karyawan
description: Sistem desain enterprise terpadu bertema Deep Forest & Fresh Lime untuk modul presensi mobile karyawan dan portal dashboard desktop GM, HR, Finance, serta Super User.
colors:
  primary: "#0D6838"
  primary-hover: "#094F2A"
  primary-subtle: "#E7F3EC"
  on-primary: "#FFFFFF"
  secondary: "#68A61C"
  secondary-hover: "#568A16"
  secondary-subtle: "#F0F8E8"
  on-secondary: "#FFFFFF"
  accent: "#F08B00"
  accent-hover: "#CC7600"
  accent-subtle: "#FEF4E6"
  on-accent: "#FFFFFF"
  warning: "#F08B00"
  warning-subtle: "#FEF4E6"
  info: "#0284C7"
  info-subtle: "#E0F2FE"
  background: "#F8FAF9"
  surface: "#FFFFFF"
  surface-alt: "#F1F5F3"
  text-primary: "#1A2E22"
  text-secondary: "#5F7367"
  border: "#E5EBE7"
  border-subtle: "#D1DCD5"
  success: "#68A61C"
  error: "#DC2626"
  error-subtle: "#FDF2F2"
typography:
  h1:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  hero-banner:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    roundedTop: "{rounded.2xl}"
    padding: "10px 16px"
  hero-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    border: "1px solid {colors.border}"
    padding: "{spacing.lg}"
  action-squircle:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.border-subtle}"
    padding: "14px"
  checkin-card:
    backgroundColor: "{colors.surface-alt}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  bottom-nav:
    backgroundColor: "{colors.surface}"
    borderTop: "1px solid {colors.border}"
    padding: "8px 12px 20px 12px"
  desktop-sidebar:
    backgroundColor: "{colors.surface}"
    borderRight: "1px solid {colors.border}"
    width: "260px"
  desktop-header:
    backgroundColor: "{colors.surface}"
    borderBottom: "1px solid {colors.border}"
    height: "64px"
  data-table:
    headerBackground: "{colors.surface-alt}"
    borderColor: "{colors.border}"
    rowHoverColor: "{colors.primary-subtle}"
---

# Panduan Sistem Desain (Design System)

## 1. Ikhtisar (Overview)
Sistem desain ini menggunakan palet identitas korporat bertema **Deep Forest & Fresh Lime** yang dipadukan dengan aksen fungsional **Warm Orange**. Sistem ini dirancang untuk:
1. **PWA / Mobile Web (Karyawan):** Antarmuka presensi luar ruangan dengan kontras natural yang teduh, mudah dibaca, serta berbasis kartu squircle ramah sentuhan.
2. **Desktop Web Portal (GM, HR, Finance, Super User):** Antarmuka panel data tabular dengan pembagian kontras yang tajam antara baris kerja, status perizinan, dan alur verifikasi multi-tier.

---

## 2. Token Warna & Semantik Status (Colors & Semantics)

### 2.1 Palet Utama & Peran Antarmuka
| Kategori Token | Nama Token | Nilai HEX | Peran & Penggunaan UI |
| :--- | :--- | :--- | :--- |
| **Primary (Brand Utama)** | `primary` | `#0D6838` | Warna dominan brand: Sidebar aktif, header aplikasi, tombol aksi utama (Clock-In), dan badge aktif. |
| **Primary Hover** | `primary-hover` | `#094F2A` | Status interaksi tombol utama saat ditekan atau disentuh kursor. |
| **Primary Subtle** | `primary-subtle` | `#E7F3EC` | Sorotan baris tabel aktif dan kontainer info departemen. |
| **Secondary (Pendukung)** | `secondary` | `#68A61C` | Elemen positif: Ikon sukses, status Tepat Waktu, dan tombol konfirmasi sekunder. |
| **Accent / Highlight** | `accent` | `#F08B00` | Penarik atensi utama: Badge Menunggu Approval, status Pending, tombol Ajukan Cuti/Izin, dan lonceng notifikasi. |
| **Background (Netral)** | `background` | `#F8FAF9` | Latar belakang kanvas aplikasi dan dashboard (teduh dan tidak menyilaukan di luar ruangan). |
| **Surface** | `surface` | `#FFFFFF` | Latar kartu informasi, kontainer formulir, dan modal pop-up. |
| **Surface Alternatif** | `surface-alt` | `#F1F5F3` | Header tabel data dan kotak rangkuman jam presensi. |
| **Border Utama** | `border` | `#E5EBE7` | Garis pemisah tabel, divider halaman, dan batas kontainer utama. |
| **Border Halus** | `border-subtle` | `#D1DCD5` | Garis batas input form dan outline kartu tombol cepat. |
| **Teks Utama** | `text-primary` | `#1A2E22` | Warna teks judul, header, dan isi tabel (*Deep Slate Green* yang ramah di mata). |
| **Teks Sekunder** | `text-secondary`| `#5F7367` | Teks keterangan, timestamp log, NIP, dan placeholder form. |

### 2.2 Penyelarasan Status Basis Data & UI
- **Positif / Sukses (`#68A61C` / background `#F0F8E8`):**
  - Presensi: `Tepat Waktu`, `Selesai Presensi`
  - Validasi GPS: `Di Dalam Radius`
  - Cuti & Izin: `Disetujui`
  - Payroll: `Diterbitkan`
- **Atensi / Menunggu (`#F08B00` / background `#FEF4E6`):**
  - Cuti & Izin: `Menunggu Approval GM`, `Menunggu Approval HR`, `Izin`
  - Payroll: `Draf`
- **Peringatan / Penolakan (`#DC2626` / background `#FDF2F2`):**
  - Presensi: `Terlambat`, `Alpa`
  - Validasi GPS: `Di Luar Radius` (Peringatan Presensi Gagal)
  - Cuti & Izin: `Ditolak GM`, `Ditolak HR`
- **Informasi Operasional (`#0284C7` / background `#E0F2FE`):**
  - Jadwal Kerja: Kategori `Shift Kerja`
  - Kuota Cuti: Tampilan `Sisa Hak Cuti`

---

## 3. Tipografi & Representasi Data (Typography)

- **Keluarga Huruf:** `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **Rasio Kontras Aksesibilitas (WCAG):**
  - Teks utama (`#1A2E22`) pada latar putih/surface menghasilkan rasio kontras tinggi di atas 13:1 (lulus WCAG AAA).
  - Teks sekunder (`#5F7367`) memberikan kontras minimal 4.6:1 (lulus WCAG AA).
- **Ketahanan Tata Letak Angka (`tabular-nums`):**
  - Jam presensi real-time, koordinat lintang/bujur GPS, serta kolom nominal gaji pada modul Payroll wajib mengaktifkan:
    ```css
    font-variant-numeric: tabular-nums;
    ```
  - Properti ini menjaga angka desimal dan digit uang tetap sejajar vertikal saat data dimuat.

---

## 4. Arsitektur Radius Sudut & Spasi (Nested Radius & Spacing)

- **Sistem Grid Spasi:** Kelipatan 4px/8px (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`).
- **Aturan Radius Konsentris (Concentric Nested Radius):**
  $$\text{Radius Dalam} = \max(0, \text{Radius Luar} - \text{Padding})$$
  - Kartu Hero Presensi (Luar): `24px` (`rounded-2xl`) dengan padding `16px`.
  - Kontainer Waktu Masuk/Pulang (Dalam): `8px`–`10px` (`rounded-md`).
  - Kartu Tombol Aksi Cepat (*Squircle Card*): `16px` (`rounded-lg`).
  - Field Input & Tombol CTA: `8px`–`10px`.
  - Badge Status / Pill: `9999px` (`rounded-full`).

---

## 5. Pola Komponen Antarmuka Antar-Peran

### 5.1 Antarmuka Karyawan (Mobile Viewport 375px–430px)
- **Hero Card Presensi:** Dilengkapi pita atas *Deep Forest* (`#0D6838`), jam kerja besar, status geofencing instan, dan tombol aksi utama presensi.
- **Tombol Aksi Ajukan Cuti/Izin:** Menggunakan warna *Warm Orange* (`#F08B00`) sebagai tombol kontras tinggi agar langsung terlihat di menu utama.
- **Bottom Navigation Dock:** Melekat di area bawah layar dengan penanda tab aktif berupa pill berwarna hijau utama (`#0D6838`).

### 5.2 Antarmuka GM, HR, Finance, & Super User (Desktop Viewport >= 1024px)
- **Sidebar Navigasi:** Latar `#FFFFFF` dengan garis batas `#E5EBE7`. Indikator menu aktif ditandai blok *Deep Forest* (`#0D6838`) dengan teks `#FFFFFF`.
- **Badge Numerik Approval:** Menggunakan warna aksen *Warm Orange* (`#F08B00`) pada panel GM dan HR untuk menunjukkan jumlah dokumen cuti/izin yang menunggu tindakan.
- **Tabel Data Terstruktur:** Header kolom menggunakan `#F1F5F3` dengan teks `#1A2E22`, dipadukan efek hover baris `#E7F3EC`. Kolom angka payroll wajib rata kanan (*right-aligned*).

---

## 6. Aturan Wajib Desain (Rules to Never Break)

1. **Anti Pure Black:** Jangan pernah menggunakan `#000000` pekat untuk teks; wajib gunakan token `text-primary` (`#1A2E22`).
2. **Pemisahan Peran Warna:**
   - Gunakan `#0D6838` untuk aksi struktural standar (Login, Clock-In, Simpan Pengaturan).
   - Gunakan `#F08B00` khusus untuk interaksi pengajuan permohonan baru atau perhatian mendesak (*pending approval*).
   - Gunakan `#68A61C` murni untuk keberhasilan atau konfirmasi tervalidasi.
3. **Target Sentuh Minimum:** Komponen interaktif mobile tidak boleh lebih kecil dari `44px x 44px`.
4. **Kejelasan Status Multi-Indikator:** Seluruh penanda status di tabel dan kartu wajib memadukan warna, ikon, dan label teks tertulis demi memenuhi standar aksesibilitas visual.