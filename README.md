# NUTRILIFE HRIS (Human Resources Information System)
**Versi:** 2.0 (Technical Architecture & Monorepo Edition)

Sistem terintegrasi kehadiran berbasis verifikasi geofencing GPS & swafoto real-time, approval cuti berjenjang 2 tahap (GM → HR), dan sinkronisasi otomatis modul Finance untuk payroll.

---

## 1. Arsitektur Monorepo

```plaintext
nutrilife-hris/
├── apps/
│   ├── web/                    # [Next.js App Router] Fullstack Dashboard Admin & Edge API
│   │   ├── app/
│   │   │   ├── (auth)/login/   # Portal Login Web Dashboard
│   │   │   ├── (dashboard)/
│   │   │   │   ├── super-user/ # Master Data (Karyawan, Lokasi/Radius GPS, Shift, Audit Log)
│   │   │   │   ├── gm/         # Monitor Divisi & Approval Cuti Tahap 1
│   │   │   │   ├── hr/         # Verifikasi Foto/GPS & Approval Cuti Final
│   │   │   │   └── finance/    # Kalkulasi Payroll, Potongan Telat/Alfa & Slip Gaji
│   │   │   └── api/            # Route Handlers REST API
│   │   ├── db/                 # Drizzle ORM Schema (Cloudflare D1 SQLite)
│   │   ├── lib/                # Haversine Geofence, State Machine Cuti, Payroll Formula, JWT
│   │   ├── wrangler.toml       # Cloudflare Pages / D1 / R2 configuration
│   │   └── tests/              # Test logika domain (Node.js test runner)
│   │
│   └── mobile/                 # [Flutter/Dart] Aplikasi Mandiri Karyawan Android (.apk)
│       ├── lib/
│       │   ├── services/       # API Client & Interceptor JWT
│       │   ├── models/         # Model User, Attendance, Leave, Payslip
│       │   └── karyawan/       # Layar Antarmuka Karyawan (screens)
│       └── pubspec.yaml
│
├── package.json                # Root pnpm workspace
└── pnpm-workspace.yaml
```

---

## 2. Alur Approval Cuti & Libur (Two-Tier State Machine)

```plaintext
[Pekerja Mengemukakan Permohonan]
              │
              ▼
    [Status: Menunggu GM]
              │
      ┌───────┴───────┐
      ▼               ▼
[Ditolak oleh GM] [Disetujui oleh GM]
      │               │
  (Selesai)           ▼
            [Status: Menunggu HR]
                      │
              ┌───────┴───────┐
              ▼               ▼
        [Ditolak oleh HR] [Disetujui oleh HR (Final)]
              │               │
          (Selesai)           ▼
                    [Sistem Kemas Kini Baki]
                    [Notifikasi kepada Pekerja]
```

- **Tahap 1 (GM):**
  - GM Tolak: status berubah jadi `DITOLAK_GM` (alur berhenti).
  - GM Setuju: status beralih ke `MENUNGGU_HR` (masuk ke antrean kerja HR).
- **Tahap 2 (HR - Final):**
  - HR Tolak: status berubah jadi `DITOLAK_HR` (alur berhenti).
  - HR Setuju: status beralih ke `FINAL_DISETUJUI`. Sistem secara otomatis memotong kuota cuti tahunan (`leaveQuota`) di basis data D1.

---

## 3. Akun Pengujian Default (Quick Demo Login)

| Role | NIK / Email | Password | Akses Utama |
|---|---|---|---|
| **Super User** | `SU001` / `superuser@nutrilife.com` | `admin123` | Konfigurasi master data, radius GPS kantor, shift kerja, audit log |
| **GM** | `GM001` / `gm@nutrilife.com` | `admin123` | Monitoring kehadiran divisi, persetujuan cuti Tahap 1 |
| **HR** | `HR001` / `hr@nutrilife.com` | `admin123` | Verifikasi swafoto & koordinat GPS, persetujuan cuti Tahap 2 (Final) |
| **Finance** | `FN001` / `finance@nutrilife.com` | `admin123` | Tarik data absensi tervalidasi, hitung potongan telat/alfa & terbitkan slip |
| **Karyawan 1** | `EMP001` / `karyawan@nutrilife.com` | `karyawan123` | Mobile app: Presensi GPS & kamera selfie, cek baki kuota, pengajuan cuti |
| **Karyawan 2** | `EMP002` / `rian@nutrilife.com` | `karyawan123` | Mobile app: Karyawan operasional gudang |

---

## 4. Cara Menjalankan

### Menjalankan Backend & Web Dashboard (Next.js)
```bash
# Instal dependensi
pnpm install

# Jalankan pengujian logika domain
pnpm test

# Build production
pnpm build:web

# Jalankan server dev
pnpm dev:web
```
Buka browser di `http://localhost:3000`.

### Menjalankan Mobile App Karyawan (Flutter)
```bash
cd apps/mobile

# Ambil dependensi Dart
flutter pub get

# Jalankan pengujian & analisa
flutter test
flutter analyze

# Jalankan aplikasi (Chrome / Android Emulator / Device)
flutter run
```
