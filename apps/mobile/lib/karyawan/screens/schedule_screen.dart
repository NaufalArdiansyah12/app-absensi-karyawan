import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';
import '../widgets/schedule/shift_timeline_view.dart';
import '../widgets/schedule/weekly_strip_calendar.dart';

class ScheduleScreen extends StatefulWidget {
  final VoidCallback? onBackToHome;

  const ScheduleScreen({super.key, this.onBackToHome});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  int _selectedDay = 3; // default Thursday
  int _activeCategory = 0; // 0: Scheduled, 1: Temporary, 2: Automatic

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Jadwal & Shift Kerja',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
        leading: widget.onBackToHome != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded, size: 20),
                onPressed: widget.onBackToHome,
              )
            : null,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Big Active Date Header with Today Chip
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '29',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.textPrimary,
                        letterSpacing: -1,
                      ),
                    ),
                    SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Thursday',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          'October 2026',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.secondarySubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppTheme.secondary.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Text(
                    'Today',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Horizontal Weekly Strip Calendar
            WeeklyStripCalendar(
              selectedDayIndex: _selectedDay,
              onSelectDay: (index) => setState(() => _selectedDay = index),
            ),
            const SizedBox(height: 16),

            // Sub-category Tab Controls
            Container(
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppTheme.border),
                ),
              ),
              child: Row(
                children: [
                  _buildSubTab(0, 'Scheduled'),
                  _buildSubTab(1, 'Temporary'),
                  _buildSubTab(2, 'Automatic'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Filter Label Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Time',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                ),
                Row(
                  children: [
                    const Text(
                      'Detail',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.swap_vert_rounded,
                      size: 16,
                      color: AppTheme.primary,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Shift Timeline View
            const ShiftTimelineView(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTab(int index, String title) {
    final isActive = _activeCategory == index;
    return InkWell(
      onTap: () => setState(() => _activeCategory = index),
      child: Container(
        padding: const EdgeInsets.only(bottom: 8, right: 16, left: 4),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? AppTheme.primary : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? AppTheme.primary : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }
}
