import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/karyawan/widgets/leave/kai_range_calendar_picker.dart';
import 'package:mobile/karyawan/widgets/leave/leave_history_card.dart';
import 'package:mobile/models/leave_model.dart';

void main() {
  setUpAll(() async {
    await initializeDateFormatting('id_ID', null);
  });

  testWidgets('KaiRangeCalendarPicker renders dates, range summary and agenda',
      (WidgetTester tester) async {
    DateTime? selectedStart;
    DateTime? selectedEnd;
    int? selectedWorkdays;

    final existingLeaves = <LeaveModel>[
      LeaveModel(
        id: 'L001',
        type: 'CUTI_TAHUNAN',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        durationDays: 3,
        reason: 'Urusan keluarga',
        status: 'MENUNGGU_GM',
      ),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: KaiRangeCalendarPicker(
              initialStartDate: DateTime(2026, 11, 2),
              initialEndDate: DateTime(2026, 11, 5),
              existingLeaves: existingLeaves,
              onRangeSelected: (start, end, workdays) {
                selectedStart = start;
                selectedEnd = end;
                selectedWorkdays = workdays;
              },
            ),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Mulai Cuti/Izin'), findsNothing);
    expect(find.text('Selesai Cuti/Izin'), findsNothing);
    expect(find.text('Keterangan & Agenda Bulan Ini'), findsNothing);

    // Tap day 15 on current month to select start date
    final day15 = find.text('15').first;
    await tester.tap(day15);
    await tester.pumpAndSettle();

    // Tap day 18 on current month to select end date
    final day18 = find.text('18').first;
    await tester.tap(day18);
    await tester.pumpAndSettle();

    expect(selectedStart, isNotNull);
    expect(selectedEnd, isNotNull);
    expect(selectedWorkdays, isNotNull);
    expect(selectedStart!.day, 15);
    expect(selectedEnd!.day, 18);

    // Verify middle dates have consistent white text matching start and end
    final Text text15 = tester.widget(find.text('15').first);
    final Text text16 = tester.widget(find.text('16').first);
    final Text text18 = tester.widget(find.text('18').first);
    expect(text15.style?.color, Colors.white);
    expect(text16.style?.color, Colors.white);
    expect(text18.style?.color, Colors.white);
  });

  testWidgets('LeaveHistoryCard renders 2-tier approval progress stepper',
      (WidgetTester tester) async {
    final item = LeaveModel(
      id: 'L002',
      type: 'IZIN_SAKIT',
      startDate: '2026-11-03',
      endDate: '2026-11-04',
      durationDays: 2,
      reason: 'Sakit flu berat',
      status: 'MENUNGGU_HR',
      gmNote: 'Disetujui silakan istirahat',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LeaveHistoryCard(item: item),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('IZIN SAKIT'), findsOneWidget);
    expect(find.text('Menunggu HR'), findsOneWidget);
    expect(find.text('Diajukan'), findsOneWidget);
    expect(find.text('Review GM'), findsOneWidget);
    expect(find.text('Final HR'), findsOneWidget);
    expect(find.textContaining('Catatan GM: Disetujui silakan istirahat'), findsOneWidget);
  });
}
