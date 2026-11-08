import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/karyawan/screens/services_screen.dart';
import 'package:mobile/models/user_model.dart';

void main() {
  testWidgets('ServicesScreen renders Cuti & Izin tab cleanly without exceptions',
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
        home: ServicesScreen(currentUser: testUser),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    // Verify segments
    expect(find.text('Cuti & Izin'), findsOneWidget);
    expect(find.text('Slip Gaji'), findsOneWidget);
    expect(find.text('Info Lembur'), findsOneWidget);

    // Verify Leave Quota Badge
    expect(find.text('Sisa Kuota Cuti Tahunan'), findsOneWidget);
    expect(find.text('12 Hari'), findsOneWidget);

    // Verify Calendar & Form
    expect(find.text('Mulai Cuti/Izin'), findsNothing);
    expect(find.text('Selesai Cuti/Izin'), findsNothing);
    expect(find.text('Formulir Pengajuan Cuti & Izin'), findsOneWidget);
    expect(find.text('Tanggal Mulai'), findsOneWidget);
    expect(find.text('Sampai Tanggal'), findsOneWidget);
    expect(find.textContaining('Total Durasi:'), findsOneWidget);
    expect(find.text('Cuti Tahunan'), findsOneWidget);
    expect(find.text('Kirim Pengajuan (Menunggu GM)'), findsOneWidget);
  });
}
