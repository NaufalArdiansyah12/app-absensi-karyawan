import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/karyawan/screens/sick_leave_screen.dart';
import 'package:mobile/models/user_model.dart';

void main() {
  setUpAll(() async {
    await initializeDateFormatting('id_ID', null);
  });

  testWidgets('SickLeaveScreen renders calendar, upload section, and form',
      (WidgetTester tester) async {
    final testUser = UserModel(
      id: 'USR001',
      nik: 'EMP001',
      name: 'Budi Santoso',
      email: 'budi@nutrilife.co.id',
      role: 'EMPLOYEE',
      division: 'Produksi',
      jobPosition: 'Staff',
      leaveQuota: 12,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: SickLeaveScreen(currentUser: testUser),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    // Verify title & info banner
    expect(find.text('Permohonan Izin Sakit'), findsWidgets);
    expect(find.text('Ketentuan Izin Sakit'), findsOneWidget);
    expect(find.textContaining('tidak memotong kuota cuti tahunan'), findsOneWidget);

    // Verify calendar & form details
    expect(find.text('Mulai Cuti/Izin'), findsNothing);
    expect(find.text('Selesai Cuti/Izin'), findsNothing);
    expect(find.text('Tanggal Mulai'), findsOneWidget);
    expect(find.text('Sampai Tanggal'), findsOneWidget);
    expect(find.text('1 Hari Kerja'), findsWidgets);

    // Verify document attachment section
    expect(find.text('Lampiran Surat Dokter / Bukti Medis'), findsOneWidget);
    expect(find.text('Foto Kamera'), findsOneWidget);
    expect(find.text('Dari Galeri'), findsOneWidget);

    // Verify submit button
    expect(find.text('Kirim Permohonan Izin Sakit'), findsOneWidget);
  });
}
