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
  late int _selectedDay;
  int _activeCategory = 0; // 0: Scheduled, 1: Temporary, 2: Automatic
  late DateTime _monday;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _monday = now.subtract(Duration(days: (now.weekday - 1)));
    _selectedDay = now.weekday - 1;
  }

  DateTime get _selectedDate => _monday.add(Duration(days: _selectedDay));

  String _formatDayName(int weekday) {
    const days = [
      'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
    ];
    return days[(weekday - 1) % 7];
  }

  String _formatMonthYear(DateTime dt) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return '${months[dt.month - 1]} ${dt.year}';
  }

  bool get _isSelectedToday {
    final now = DateTime.now();
    final dt = _selectedDate;
    return now.year == dt.year && now.month == dt.month && now.day == dt.day;
  }

  @override
  Widget build(BuildContext context) {
    final curDate = _selectedDate;

    return Scaffold(
      backgroundColor: AppTheme.primary,
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
      body: AppTheme.curvedBody(
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            // Active Date Header with Today Chip
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${curDate.day}',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.textPrimary,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _formatDayName(curDate.weekday),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          _formatMonthYear(curDate),
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                if (_isSelectedToday)
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
                      'Hari Ini',
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
                  _buildSubTab(0, 'Terjadwal'),
                  _buildSubTab(1, 'Sementara'),
                  _buildSubTab(2, 'Otomatis'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Filter Label Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Waktu',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                ),
                Row(
                  children: [
                    const Text(
                      'Detail Shift',
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
            const SizedBox(height: 120),
          ],
        ),
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
