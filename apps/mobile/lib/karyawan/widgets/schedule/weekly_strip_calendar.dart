import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class DayItem {
  final String dayName;
  final int dateNumber;
  final bool isSunday;
  final List<Color> dots;

  const DayItem({
    required this.dayName,
    required this.dateNumber,
    this.isSunday = false,
    this.dots = const [],
  });
}

class WeeklyStripCalendar extends StatelessWidget {
  final int selectedDayIndex;
  final ValueChanged<int> onSelectDay;

  const WeeklyStripCalendar({
    super.key,
    required this.selectedDayIndex,
    required this.onSelectDay,
  });

  static const List<DayItem> days = [
    DayItem(
      dayName: 'Mon',
      dateNumber: 26,
      dots: [Color(0xFFF87171), Color(0xFFFBBF24)],
    ),
    DayItem(
      dayName: 'Tue',
      dateNumber: 27,
      dots: [Color(0xFFFBBF24), Color(0xFF38BDF8)],
    ),
    DayItem(
      dayName: 'Wed',
      dateNumber: 28,
      dots: [Colors.white, Color(0xFFA7F3D0)],
    ),
    DayItem(
      dayName: 'Thu',
      dateNumber: 29,
      dots: [Color(0xFFF87171), Color(0xFFFBBF24)],
    ),
    DayItem(
      dayName: 'Fri',
      dateNumber: 30,
      dots: [Color(0xFFF87171)],
    ),
    DayItem(
      dayName: 'Sat',
      dateNumber: 31,
      dots: [Color(0xFFFBBF24)],
    ),
    DayItem(
      dayName: 'Sun',
      dateNumber: 1,
      isSunday: true,
      dots: [],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(days.length, (index) {
          final item = days[index];
          final isSelected = index == selectedDayIndex;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => onSelectDay(index),
              borderRadius: BorderRadius.circular(14),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 48,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppTheme.primary
                      : item.isSunday
                          ? const Color(0xFFFEE2E2)
                          : AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primary
                        : item.isSunday
                            ? const Color(0xFFFECDD3)
                            : AppTheme.border,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppTheme.primary.withValues(alpha: 0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 3),
                          )
                        ]
                      : null,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      item.dayName,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? Colors.white.withValues(alpha: 0.9)
                            : item.isSunday
                                ? const Color(0xFFDC2626)
                                : AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${item.dateNumber}',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: isSelected
                            ? Colors.white
                            : item.isSunday
                                ? const Color(0xFFDC2626)
                                : AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: item.dots.map((dotColor) {
                        return Container(
                          width: 4,
                          height: 4,
                          margin: const EdgeInsets.symmetric(horizontal: 1),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white : dotColor,
                            shape: BoxShape.circle,
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
