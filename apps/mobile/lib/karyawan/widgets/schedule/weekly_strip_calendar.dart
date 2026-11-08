import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class WeeklyStripCalendar extends StatelessWidget {
  final int selectedDayIndex;
  final ValueChanged<int> onSelectDay;

  const WeeklyStripCalendar({
    super.key,
    required this.selectedDayIndex,
    required this.onSelectDay,
  });

  List<Map<String, dynamic>> _getWeekDays() {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: (now.weekday - 1)));
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return List.generate(7, (i) {
      final date = monday.add(Duration(days: i));
      final isSunday = i == 6;
      final isToday = date.year == now.year && date.month == now.month && date.day == now.day;

      return {
        'dayName': names[i],
        'dateNumber': date.day,
        'date': date,
        'isSunday': isSunday,
        'isToday': isToday,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final days = _getWeekDays();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(days.length, (index) {
          final item = days[index];
          final isSelected = index == selectedDayIndex;
          final isSunday = item['isSunday'] as bool;
          final isToday = item['isToday'] as bool;

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
                      : isSunday
                          ? const Color(0xFFFEE2E2)
                          : AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? AppTheme.primary
                        : isSunday
                            ? const Color(0xFFFECDD3)
                            : isToday
                                ? AppTheme.secondary
                                : AppTheme.border,
                    width: isToday && !isSelected ? 1.5 : 1,
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
                      item['dayName'] as String,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? Colors.white.withValues(alpha: 0.9)
                            : isSunday
                                ? const Color(0xFFDC2626)
                                : AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${item['dateNumber']}',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: isSelected
                            ? Colors.white
                            : isSunday
                                ? const Color(0xFFDC2626)
                                : AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white
                                : isToday
                                    ? AppTheme.secondary
                                    : const Color(0xFFFBBF24),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
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
