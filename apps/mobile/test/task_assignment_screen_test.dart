import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/karyawan/screens/task_assignment_screen.dart';
import 'package:mobile/models/task_model.dart';

void main() {
  test('TaskModel parses JSON and defaults correctly', () {
    final json = {
      'id': 'task_1',
      'title': 'Audit Gudang',
      'description': 'Lakukan audit stok',
      'assignedBy': 'usr_gm',
      'assignedByName': 'Budi Santoso (GM)',
      'assignedTo': 'usr_emp_1',
      'priority': 'HIGH',
      'status': 'PENDING',
      'dueDate': '2026-11-20',
      'createdAt': 1700000000,
      'updatedAt': 1700000000,
    };

    final task = TaskModel.fromJson(json);
    expect(task.id, 'task_1');
    expect(task.title, 'Audit Gudang');
    expect(task.priority, 'HIGH');
    expect(task.status, 'PENDING');
    expect(task.completionNotes, isNull);
    expect(task.revisionNotes, isNull);
  });

  testWidgets('TaskAssignmentScreen renders header, KPI, and filter chips',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: TaskAssignmentScreen(),
      ),
    );

    // Initial pump
    await tester.pump();

    // Verify AppBar title
    expect(find.text('Penugasan & Tanggung Jawab'), findsOneWidget);

    // Verify KPI indicators
    expect(find.text('Perlu Dikerjakan'), findsOneWidget);
    expect(find.text('Review GM'), findsWidgets);
    expect(find.text('Selesai'), findsWidgets);

    // Verify filter chips
    expect(find.text('Semua'), findsOneWidget);
    expect(find.text('Belum Mulai'), findsOneWidget);
    expect(find.text('Dikerjakan'), findsOneWidget);
  });
}
