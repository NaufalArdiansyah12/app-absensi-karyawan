import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/user_model.dart';
import 'package:mobile/karyawan/widgets/attendance/attendance_timeline_modal.dart';

void main() {
  final testUser = UserModel(
    id: 'user_1',
    nik: 'EMP001',
    name: 'Budi Santoso',
    email: 'budi@nutrilife.co.id',
    role: 'EMPLOYEE',
    division: 'Quality Control',
    jobPosition: 'QC Specialist',
    leaveQuota: 12,
  );

  testWidgets(
      'Attendance timeline modal flow: Lokasi (OSM) -> Selfie -> Konfirmasi',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AttendanceTimelineModal(
            isCheckIn: true,
            currentUser: testUser,
            initialLat: -6.175392,
            initialLng: 106.827153,
            initialPhotoBytes: Uint8List.fromList([1, 2, 3, 4]),
          ),
        ),
      ),
    );

    // 1. Step 1: Deteksi Lokasi & Peta OSM
    expect(find.text('OpenStreetMap Live'), findsOneWidget);
    expect(find.text('Lokasi Berhasil Terdeteksi'), findsOneWidget);
    expect(find.text('Lanjut: Ambil Foto Selfie'), findsOneWidget);

    // Tap lanjut ke Step 2
    await tester.tap(find.text('Lanjut: Ambil Foto Selfie'));
    await tester.pumpAndSettle();

    // 2. Step 2: Kamera Swafoto (dengan foto sudah terpasang & tombol kembali rapi)
    expect(find.text('Foto Ulang'), findsOneWidget);
    expect(find.text('Lanjut ke Konfirmasi'), findsOneWidget);
    expect(find.text('Kembali ke Peta Lokasi'), findsOneWidget);

    // Lanjut ke Step 3: Konfirmasi
    await tester.tap(find.text('Lanjut ke Konfirmasi'));
    await tester.pumpAndSettle();

    // 3. Step 3: Konfirmasi Data Absensi
    expect(find.text('Ringkasan Data Presensi'), findsOneWidget);
    expect(find.text('Budi Santoso'), findsOneWidget);
    expect(find.text('OpenStreetMap Terverifikasi'), findsOneWidget);
    expect(find.text('Konfirmasi Absen Masuk'), findsOneWidget);
  });
}
