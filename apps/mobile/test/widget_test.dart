import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Nutrilife HRIS smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const NutrilifeApp());
    expect(find.text('NUTRILIFE HRIS'), findsOneWidget);
  });
}
