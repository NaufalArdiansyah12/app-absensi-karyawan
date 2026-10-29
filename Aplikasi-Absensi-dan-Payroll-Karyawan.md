# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Aplikasi Absensi Karyawan

**STATUS: DRAFT SEMENTARA**

| | |
| --- | --- |
| **Nama Produk** | Aplikasi Absensi dan Payroll Karyawan |
| **Versi Dokumen** | v0.1 (Draft Sementara) |
| **Disusun oleh** | Tim Pengembang (Pengembang) |
| **Untuk** | Manajemen Perusahaan (Klien) |
| **Tanggal** | 20 Mei 2024 |
| **Dokumen Terkait** | Notulen Diskusi Kebutuhan Sistem Absensi & Payroll |

---

# 1. Ringkasan Produk (Overview)

Pengelolaan data kehadiran karyawan, permohonan izin/cuti, serta pemrosesan payroll yang masih berjalan terpisah atau manual kerap menghadapi risiko ketidakakuratan data, lambatnya alur verifikasi izin, serta potensi kecurangan presensi di luar lokasi kerja. Kondisi ini menyulitkan jajaran manajemen dalam melakukan pengawasan kedisiplinan secara real-time dan memperpanjang proses rekapitulasi data kehadiran yang menjadi dasar utama pembayaran upah karyawan oleh tim Finance.

Aplikasi Absensi Karyawan ini dirancang sebagai solusi tata kelola presensi dan penggajian berbasis web/mobile terpadu yang dilengkapi validasi lokasi radius GPS dan jam kerja shift. Sistem ini mencakup panel administrasi master data, alur persetujuan cuti/izin berjenjang (General Manager sebagai approval tahap pertama dan HR sebagai approval tahap akhir), modul evaluasi kedisiplinan kerja, hingga integrasi data absensi tervalidasi ke modul kalkulasi payroll otomatis. Tujuannya adalah memastikan transparansi operasional, efisiensi rantai birokrasi perizinan, dan akurasi perhitungan hak kompensasi karyawan.

# 2. Tujuan & Sasaran (Goals)

- Memusatkan seluruh pengelolaan master data kepegawaian, struktur organisasi, jadwal kerja, dan riwayat presensi dalam satu sistem terintegrasi.
- Mengurangi risiko kecurangan absensi dan ketidaksesuaian jam kerja melalui penerapan restriksi radius GPS dan pengaturan shift yang terstandarisasi.
- Mempercepat alur peninjauan dan persetujuan pengajuan cuti serta izin melalui mekanisme approval berjenjang dua tingkat (GM dan HR) yang transparan dan terdokumentasi.
- Menyediakan data kehadiran yang tervalidasi secara otomatis untuk mempermudah penghitungan gaji, lembur, potongan kedisiplinan, BPJS, dan pajak oleh tim Finance.
- Memberikan visibilitas menyeluruh bagi manajemen (GM dan HR) dalam memantau rekapitulasi kehadiran, tingkat keterlambatan, dan performa kedisiplinan karyawan.

# 3. Pengguna & Peran (Users & Roles)

- **Super User :** Bertindak sebagai pengelola sistem teknis dengan hak akses penuh terhadap konfigurasi akun pengguna & hak akses (user & role), master data karyawan, master divisi, master jabatan, master lokasi kerja, konfigurasi radius GPS, jam kerja/shift, penetapan jatah cuti, pengaturan sistem, serta pemantauan log audit (audit log) tanpa terlibat dalam alur persetujuan operasional harian.
- **General Manager (GM) :** Bertanggung jawab atas pengawasan menyeluruh terhadap kondisi perusahaan, kedisiplinan, absensi seluruh karyawan, dan peninjauan laporan operasional, serta bertindak sebagai pihak pemberi persetujuan (approval) tahap pertama untuk seluruh pengajuan cuti dan izin karyawan.
- **Human Resources (HR) :** Bertindak sebagai verifikator akhir administrasi kepegawaian yang bertugas memonitor kehadiran, keterlambatan, izin, dan cuti, mengevaluasi kedisiplinan serta kinerja kehadiran, memvalidasi data karyawan, menyusun laporan HR, dan memberikan persetujuan akhir (final approval) atas permohonan cuti dan izin.
- **Finance :** Bertanggung jawab mengelola proses penggajian (payroll) dengan memanfaatkan data kehadiran dan administrasi yang telah tervalidasi dari HR, mencakup kalkulasi gaji pokok, tunjangan, potongan kehadiran/keterlambatan, upah lembur, bonus, iuran BPJS, pemotongan pajak, penerbitan slip gaji, serta rekapitulasi laporan payroll.
- **Karyawan :** Pengguna operasional yang melakukan pencatatan absensi masuk dan pulang berdasarkan titik lokasi GPS dan shift yang ditentukan, mengajukan permohonan cuti maupun izin, serta mengakses slip gaji secara mandiri.

# 4. Ruang Lingkup (Scope)

## 4.1 Termasuk (MVP)

- Modul Pengaturan Sistem & Master Data: Pengelolaan user, role, master karyawan, divisi, jabatan, lokasi kantor, kuota cuti, dan audit log oleh Super User.
- Modul Manajemen Waktu & Presensi: Konfigurasi shift/jam kerja, penentuan radius GPS presensi, dan pencatatan presensi datang/pulang.
- Modul Pengajuan & Approval Berjenjang: Mekanisme pengajuan izin/cuti dengan alur approval dua tingkat (Tahap 1: GM, Tahap 2/Final: HR).
- Modul Monitoring & Evaluasi Kehadiran: Dashboard pemantauan presensi, keterlambatan, kedisiplinan, dan laporan rekapitulasi untuk GM dan HR.
- Modul Payroll & Kompensasi: Perhitungan gaji pokok, tunjangan, potongan, lembur, bonus, kalkulasi BPJS, pajak, penerbitan slip gaji, dan rekap laporan penggajian oleh Finance.

## 4.2 Di Luar Lingkup Awal / Fase Lanjutan

Belum ada fitur yang ditunda pada tahap ini; seluruh modul fungsional yang didefinisikan pada kebutuhan peran (Super User, GM, HR, dan Finance) masuk ke dalam cakupan rilis awal. Kebutuhan pengembangan tingkat lanjut akan dirinci pada Bab 11.

# 5. Asumsi & Batasan (Assumptions & Constraints)

- **[Asumsi Pengembang]** Perangkat yang digunakan karyawan untuk melakukan presensi memiliki fitur penentuan posisi (GPS) yang aktif dan browser/aplikasi yang mendukung izin akses geolokasi.
- **[Asumsi Pengembang]** Kestabilan pencatatan lokasi absensi dan akurasi koordinat presensi bergantung pada ketersediaan koneksi internet serta presisi sensor GPS pada perangkat pengguna.
- **[Asumsi Pengembang]** Alur notifikasi approval cuti/izin (tahap 1 GM dan tahap 2 HR) pada MVP diasumsikan berjalan secara in-app notification atau berbasis email standar.
- **[Batasan]** Super User secara sistem dikunci untuk tidak memiliki wewenang approval pada alur transaksi operasional (cuti dan izin) guna menjaga pemisahan tugas (segregation of duties).
- **[Batasan]** Modul Finance tidak melakukan penarikan data perbankan secara langsung (tidak terhubung direct payment gateway/disbursement API bank) pada tahap ini; output modul berupa slip gaji dan rekap data payroll untuk transfer manual atau impor massal.
- **[Batasan]** Ketentuan rincian perhitungan formula pajak (PPh 21) dan skema iuran BPJS diasumsikan mengikuti regulasi ketenagakerjaan Indonesia yang berlaku, dengan formula spesifik yang akan dikonfirmasi lebih lanjut.

# 6. Kebutuhan Fungsional (Functional Requirements)

## 6.1 Super User - Pengelolaan Master Data & Konfigurasi Sistem

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **ADM-1** | Super User dapat mengelola akun pengguna serta menetapkan hak akses peran (user & role). | **Wajib** |
| **ADM-2** | Super User dapat mengelola master data karyawan (tambah, ubah, nonaktifkan, dan lihat data). | **Wajib** |
| **ADM-3** | Super User dapat mengelola data master divisi dan master jabatan perusahaan. | **Wajib** |
| **ADM-4** | Super User dapat mengelola master lokasi kantor beserta penentuan titik koordinat dan batasan radius GPS presensi. | **Wajib** |
| **ADM-5** | Super User dapat mengonfigurasi data master shift dan jam kerja karyawan. | **Wajib** |
| **ADM-6** | Super User dapat mengatur besaran alokasi jatah cuti tahunan maupun cuti khusus untuk karyawan. | **Wajib** |
| **ADM-7** | Super User dapat mengelola pengaturan umum sistem (setting sistem). | **Penting** |
| **ADM-8** | Super User dapat melihat dan memantau riwayat aktivitas operasional pada sistem melalui log audit (audit log). | **Wajib** |

## 6.2 Karyawan - Pencatatan Kehadiran (Presensi)

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **ABS-1** | Karyawan dapat melakukan pencatatan presensi masuk (clock-in) dan presensi pulang (clock-out) sesuai jadwal shift yang berlaku. | **Wajib** |
| **ABS-2** | Sistem memvalidasi koordinat lokasi perangkat karyawan saat presensi agar berada di dalam batas radius GPS lokasi yang ditentukan. | **Wajib** |
| **ABS-3** | Sistem menolak pencatatan presensi dan menampilkan peringatan jika posisi karyawan berada di luar batas radius GPS yang ditentukan. | **Wajib** |
| **ABS-4** | Karyawan dapat melihat riwayat kehadiran, status keterlambatan, dan jam kerja pribadi. | **Penting** |

## 6.3 GM & HR - Pengajuan & Approval Cuti/Izin

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **CUT-1** | Karyawan dapat membuat dan mengirimkan permohonan cuti atau izin dengan mencantumkan tanggal, tipe pengajuan, dan alasan. | **Wajib** |
| **CUT-2** | GM dapat melihat daftar pengajuan cuti dan izin dari seluruh karyawan yang memerlukan persetujuan. | **Wajib** |
| **CUT-3** | GM dapat memberikan persetujuan (approve) atau penolakan (reject) sebagai approval tahap pertama pada permohonan cuti dan izin. | **Wajib** |
| **CUT-4** | HR dapat melihat pengajuan cuti dan izin yang telah disetujui pada tahap pertama oleh GM. | **Wajib** |
| **CUT-5** | HR dapat memberikan persetujuan akhir (final approval) atau penolakan (reject) terhadap permohonan cuti dan izin karyawan. | **Wajib** |
| **CUT-6** | Sistem memperbarui sisa kuota jatah cuti karyawan secara otomatis setelah permohonan cuti disetujui secara final oleh HR. | **Wajib** |

## 6.4 GM & HR - Monitoring, Evaluasi, dan Laporan

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **MON-1** | GM dapat memonitor absensi, kedisiplinan, dan kondisi kehadiran seluruh karyawan perusahaan secara menyeluruh. | **Wajib** |
| **MON-2** | GM dapat mengakses dan melihat laporan operasional kehadiran dan kedisiplinan karyawan. | **Penting** |
| **MON-3** | HR dapat memonitor data kehadiran harian, tingkat keterlambatan, pengajuan izin, dan cuti karyawan. | **Wajib** |
| **MON-4** | HR dapat melakukan validasi terhadap kelengkapan dan keabsahan data karyawan. | **Wajib** |
| **MON-5** | HR dapat melakukan evaluasi terhadap catatan kedisiplinan dan kinerja kehadiran karyawan. | **Penting** |
| **MON-6** | HR dapat membuat, menampilkan, dan mengunduh laporan rekapitulasi data kehadiran dan kedisiplinan (laporan HR). | **Wajib** |

## 6.5 Finance - Manajemen Penggajian (Payroll)

| **ID** | **Kebutuhan Fungsional** | **Prioritas** |
| --- | --- | --- |
| **PAY-1** | Finance dapat menarik data kehadiran, keterlambatan, lembur, izin, dan cuti yang telah tervalidasi dari sistem absensi dan HR. | **Wajib** |
| **PAY-2** | Finance dapat menghitung kalkulasi gaji pokok, tunjangan, dan bonus bagi setiap karyawan. | **Wajib** |
| **PAY-3** | Finance dapat menghitung komponen potongan kehadiran/kedisiplinan dan upah lembur secara otomatis berdasarkan data presensi tervalidasi. | **Wajib** |
| **PAY-4** | Finance dapat melakukan kalkulasi pemotongan iuran BPJS dan potongan pajak (PPh 21) karyawan. | **Wajib** |
| **PAY-5** | Finance dapat menerbitkan slip gaji elektronik bagi masing-masing karyawan pada setiap periode penggajian. | **Wajib** |
| **PAY-6** | Finance dapat membuat dan mengunduh laporan rekapitulasi payroll perusahaan per periode penggajian. | **Wajib** |
| **PAY-7** | Karyawan dapat melihat dan mengunduh slip gaji pribadi yang telah dipublikasikan oleh Finance. | **Wajib** |

# 7. Alur Pengguna Utama (Key User Flows)

## 7.1 Alur Pencatatan Kehadiran (Presensi) Karyawan

1. Karyawan membuka aplikasi pada perangkat dan mengakses menu Presensi.
2. Sistem mendeteksi koordinat GPS perangkat karyawan serta memeriksa jadwal shift kerja yang aktif pada hari tersebut.
3. Karyawan menekan tombol "Clock In" untuk mencatat jam masuk.
4. Sistem memvalidasi jarak posisi GPS perangkat terhadap titik koordinat master lokasi kantor.
   - *Kasus Valid:* Jika berada di dalam radius, presensi tercatat dengan status "Tepat Waktu" atau "Terlambat", dan data absensi masuk tersimpan ke sistem.
   - *Kasus Di Luar Radius:* Jika berada di luar radius GPS, sistem menolak pencatatan presensi, menampilkan pesan galat "Anda berada di luar radius lokasi kerja", dan status absensi tetap "Belum Hadir".
5. Pada akhir jam kerja, Karyawan kembali membuka menu Presensi dan menekan tombol "Clock Out" untuk mencatat jam kepulangan dengan validasi radius GPS yang sama.
6. Sistem memperbarui data kehadiran karyawan menjadi "Selesai Presensi".

## 7.2 Alur Pengajuan dan Approval Cuti/Izin Berjenjang

1. Karyawan mengisi formulir permohonan pada modul perizinan dengan memilih jenis pengajuan (Cuti/Izin), menentukan tanggal mulai dan selesai, serta mengisi alasan permohonan.
2. Karyawan menekan tombol "Kirim Pengajuan". Sistem mencatat pengajuan dengan status "Menunggu Approval GM" dan memverifikasi sisa kuota cuti jika jenis permohonan adalah cuti.
3. General Manager (GM) mengakses dashboard monitoring, membuka daftar permohonan cuti/izin yang masuk, dan memeriksa rincian pengajuan.
4. GM menentukan keputusan:
   - Jika GM menolak: GM mengisi alasan penolakan dan status pengajuan berubah menjadi "Ditolak GM". Alur berhenti dan Karyawan menerima informasi penolakan.
   - Jika GM menyetujui: GM menekan tombol konfirmasi approval. Status pengajuan diperbarui menjadi "Menunggu Approval HR".
5. HR mengakses daftar permohonan yang telah lolos verifikasi tahap pertama untuk melakukan validasi administratif.
6. HR menentukan keputusan akhir:
   - Jika HR menolak: HR mengisi alasan penolakan dan status pengajuan berubah menjadi "Ditolak HR". Alur berhenti.
   - Jika HR menyetujui: HR menekan tombol konfirmasi approval akhir. Status pengajuan berubah menjadi "Disetujui".
7. Sistem secara otomatis memotong kuota cuti karyawan yang bersangkutan (jika pengajuan cuti) dan mencatat izin/cuti tersebut pada rekap absensi karyawan.

## 7.3 Alur Pengelolaan Payroll oleh Tim Finance

1. Tim Finance mengakses modul Payroll pada akhir periode penggajian.
2. Finance memilih periode bulan dan tahun penggajian, lalu menjalankan fungsi "Tarik Data Valid".
3. Sistem mengumpulkan dan memuat data kehadiran tervalidasi dari HR, mencakup jumlah hari kerja, total keterlambatan, jam lembur, serta rekapan izin/cuti.
4. Finance memverifikasi komponen gaji yang meliputi gaji pokok, tunjangan, perhitungan lembur, bonus, potongan keterlambatan/kehadiran, pemotongan iuran BPJS, dan potongan pajak.
5. Finance menekan tombol "Kalkulasi Payroll". Sistem menghitung total penerimaan bersih (take home pay) untuk setiap karyawan.
6. Finance meninjau hasil kalkulasi, melakukan penyesuaian bila terdapat insentif khusus, lalu menekan tombol "Finalisasi & Terbitkan Slip Gaji".
7. Status payroll periode tersebut berubah menjadi "Selesai/Diterbitkan".
8. Rekapitulasi payroll tersimpan untuk kebutuhan pembukuan Finance, dan Karyawan dapat langsung melihat serta mengunduh rincian slip gaji pada akun masing-masing.

# 8. Model Data (High-Level)

| **Entitas** | **Field Utama** | **Keterangan** |
| --- | --- | --- |
| **roles** | id, nama_peran, deskripsi, dibuat_pada, diperbarui_pada | Menyimpan data peran pengguna sistem (Super User, GM, HR, Finance, Karyawan). |
| **users** | id, id_role, nama_pengguna, surel, kata_sandi_hash, apakah_aktif, dibuat_pada, diperbarui_pada | Menyimpan data kredensial akses dan autentikasi akun pengguna sistem. |
| **divisi** | id, nama_divisi, dibuat_pada, diperbarui_pada | Menyimpan struktur divisi/departemen dalam perusahaan. |
| **jabatan** | id, nama_jabatan, dibuat_pada, diperbarui_pada | Menyimpan jenjang jabatan operasional karyawan. |
| **lokasi_kantor** | id, nama_lokasi, lintang, bujur, radius_meter, dibuat_pada, diperbarui_pada | Menyimpan koordinat kantor dan batas toleransi jarak geofencing untuk presensi. |
| **shift_kerja** | id, nama_shift, jam_masuk, jam_pulang, dibuat_pada, diperbarui_pada | Menyimpan konfigurasi pola dan batasan jam kerja. |
| **karyawan** | id, id_user, nip, nama_lengkap, id_divisi, id_jabatan, id_lokasi, id_shift, gaji_pokok, sisa_kuota_cuti, dibuat_pada, diperbarui_pada | Menyimpan profil induk karyawan yang berelasi 1-ke-1 dengan tabel users serta master data terkait. |
| **presensi** | id, id_karyawan, id_shift, tanggal, waktu_masuk, waktu_pulang, lintang_masuk, bujur_masuk, lintang_pulang, bujur_pulang, status_kehadiran, dibuat_pada, diperbarui_pada | Menyimpan transaksi presensi harian beserta titik koordinat geolokasi clock-in dan clock-out. |
| **pengajuan_cuti_izin** | id, id_karyawan, jenis_pengajuan, tanggal_mulai, tanggal_selesai, alasan, status_persetujuan, disetujui_gm_oleh, waktu_approval_gm, disetujui_hr_oleh, waktu_approval_hr, catatan_penolakan, dibuat_pada, diperbarui_pada | Menyimpan transaksi permohonan cuti/izin beserta jejak verifikasi berjenjang oleh GM dan HR. |
| **penggajian** | id, id_karyawan, periode_bulan, periode_tahun, gaji_pokok, tunjangan, upah_lembur, bonus, potongan_kehadiran, potongan_bpjs, potongan_pajak, gaji_bersih, status_pembayaran, diterbitkan_pada | Menyimpan rekapitulasi perhitungan take home pay dan rincian payroll karyawan per periode. |
| **log_audit** | id, id_user, tindakan, modul, deskripsi, alamat_ip, dibuat_pada | Menyimpan jejak rekam kronologis atas perubahan data dan aktivitas penting di sistem. |

**Catatan:** field dalam [tanda kurung siku] merupakan bagian dari fitur usulan/Fase Lanjutan (Bab 11).

# 9. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- **Keamanan & Hak Akses :** Menerapkan mekanisme Role-Based Access Control (RBAC) yang ketat untuk mengisolasi wewenang antar peran; seluruh data sensitif seperti nominal gaji dan kata sandi pengguna wajib dienkripsi saat transit (HTTPS/TLS) maupun saat disimpan (at rest) menggunakan algoritma enkripsi standar industri.
- **Akurasi & Integritas Geolokasi :** Sistem presensi harus memverifikasi titik koordinat perangkat terhadap radius GPS kantor dalam waktu kurang dari 3 detik serta memiliki mekanisme deteksi manipulasi lokasi (mock location/fake GPS) guna mencegah kecurangan presensi.
- **Performa & Skalabilitas :** Sistem mampu menangani lonjakan beban akses bersamaan (traffic spike) saat jam masuk dan pulang kerja tanpa terjadi penurunan performa atau waktu henti (downtime), dengan waktu respons rata-rata pencatatan presensi di bawah 2 detik.
- **Auditabilitas :** Seluruh aktivitas modifikasi master data, penyesuaian konfigurasi sistem, dan proses kalkulasi payroll wajib tercatat ke dalam audit log yang bersifat kekal (immutable) dan tidak dapat dimanipulasi oleh pengguna mana pun.
- **Responsivitas Perangkat :** Antarmuka pengguna untuk modul presensi karyawan dan monitoring pimpinan harus responsif serta beroperasi optimal saat diakses melalui peramban web pada ponsel pintar (mobile browser) maupun desktop.

# 10. Integrasi Pihak Ketiga

| **Layanan** | **Fungsi** | **Catatan** |
| --- | --- | --- |
| **Geocoding & Maps API (OpenStreetMap / Google Maps)** | Menampilkan peta visual lokasi kantor serta memvalidasi penentuan titik koordinat dan kalkulasi radius GPS. | Wajib untuk konfigurasi master lokasi dan validasi batas presensi karyawan. |
| **Layanan Pengiriman Email (SMTP Relay)** | Mengirimkan notifikasi pemberitahuan pengajuan izin/cuti ke GM/HR dan pengiriman notifikasi slip gaji ke karyawan. | Digunakan untuk alur notifikasi standar sistem pada MVP. |
| **Payment Gateway / Direct Bank Disbursement** | Eksekusi transfer otomatis pembayaran gaji dari modul payroll langsung ke rekening bank karyawan. | Fase Lanjutan; pada MVP penggajian masih menggunakan mekanisme rekapitulasi data dan transfer manual/impor file bank. |

# 11. Fitur Usulan / Fase Lanjutan

- **Verifikasi Biometrik Wajah (Face Recognition & Liveness Detection).** Penambahan verifikasi swafoto dengan deteksi keaktifan wajah saat karyawan melakukan clock-in/clock-out untuk memperkuat validasi radius GPS dan mencegah praktik penitipan presensi antar karyawan.
- **Integrasi WhatsApp Gateway untuk Notifikasi Approval.** Pengiriman notifikasi pengingat approval cuti/izin secara instan langsung ke WhatsApp GM dan HR, serta pengiriman bukti status persetujuan ke karyawan guna mempercepat alur birokrasi operasional.
- **Ekspor Format Transfer Payroll Bank (Bulk Disbursement File).** Penyediaan generator format file transfer massal yang kompatibel dengan format perbankan korporat tertentu (misalnya format CSV/Excel payroll BCA, Mandiri, atau BNI) untuk memudahkan Finance mengeksekusi transfer gaji.

# 12. Pertanyaan Terbuka / TBD

- Berapa besaran toleransi keterlambatan (grace period) sebelum sistem menandai status karyawan sebagai "Terlambat"?
- Bagaimana formula spesifik pemotongan gaji akibat keterlambatan atau ketidakhadiran tanpa keterangan (apakah berbentuk nominal flat per menit/kejadian atau persentase dari gaji pokok)?
- Apakah skema perhitungan lembur mengikuti formula standar ketenagakerjaan pemerintah (1/173 x upah sebulan) atau perusahaan memiliki tabel tarif lembur internal tersendiri?
- Skema kalkulasi pajak PPh 21 apa yang diterapkan oleh perusahaan (metode Gross, Gross-Up, atau Net) dan apakah sudah mengadopsi mekanisme TER (Tarif Efektif Rata-Rata) terbaru?
- Apakah jatah cuti tahunan yang tidak terpakai pada akhir periode tahunan akan hangus secara otomatis atau dapat diakumulasikan (carry over) ke tahun berikutnya?
- Platform teknologi target untuk Karyawan: apakah aplikasi presensi dirilis dalam bentuk Progressive Web App (PWA) berbasis peramban mobile atau aplikasi native (Android APK / iOS)?

# 13. Glosarium

- **Clock-In / Clock-Out :** Aksi pencatatan waktu kehadiran saat karyawan memulai jam kerja (masuk) dan mengakhiri jam kerja (pulang).
- **Radius GPS (Geofencing) :** Batas wilayah virtual melingkar dengan jarak toleransi tertentu (dalam meter) di sekitar titik koordinat master lokasi kantor yang diizinkan untuk presensi.
- **Approval Berjenjang :** Prosedur persetujuan permohonan yang membutuhkan konfirmasi lebih dari satu pihak secara berurutan (tahap pertama oleh GM, dilanjutkan tahap akhir oleh HR).
- **Audit Log :** Catatan rekam jejak digital kronologis yang mendokumentasikan siapa, kapan, dan tindakan apa yang dilakukan pada sistem untuk tujuan akuntabilitas.
- **Payroll :** Modul administrasi dan kalkulasi penggajian yang merangkum gaji pokok, tunjangan, lembur, bonus, serta potongan iuran wajib maupun kehadiran.
- **Take Home Pay :** Jumlah total kompensasi bersih yang diterima karyawan setelah seluruh komponen pendapatan ditambahkan dan seluruh potongan (pajak, BPJS, keterlambatan) dikurangkan.
- **Mock Location :** Fitur atau aplikasi pada perangkat pengguna yang memanipulasi koordinat GPS asli untuk mengelabui validasi lokasi presensi.

---

*Dokumen ini merupakan draft sementara dan dapat berubah seiring pembahasan lebih lanjut dengan klien.*