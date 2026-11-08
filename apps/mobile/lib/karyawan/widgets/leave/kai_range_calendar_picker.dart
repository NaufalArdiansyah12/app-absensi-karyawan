import 'package:flutter/material.dart';
import '../../../models/leave_model.dart';
import '../../../../theme/app_theme.dart';

class KaiRangeCalendarPicker extends StatefulWidget {
  final DateTime? initialStartDate;
  final DateTime? initialEndDate;
  final List<LeaveModel> existingLeaves;
  final Function(DateTime startDate, DateTime endDate, int workdays) onRangeSelected;

  // Daftar Hari Libur Nasional & Cuti Bersama 2026
  static const Map<String, String> nationalHolidays = {
    '2026-01-01': 'Tahun Baru 2026 Masehi',
    '2026-02-17': 'Tahun Baru Imlek 2577',
    '2026-03-20': 'Hari Raya Idul Fitri 1447 H',
    '2026-03-21': 'Cuti Bersama Idul Fitri',
    '2026-05-01': 'Hari Buruh Internasional',
    '2026-05-27': 'Hari Raya Idul Adha 1447 H',
    '2026-08-17': 'Hari Kemerdekaan RI ke-81',
    '2026-11-02': 'Hari Libur Nasional / Cuti Bersama',
    '2026-12-25': 'Hari Raya Natal',
  };

  static String formatDateKey(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  // Hitung hari kerja (skip hari Minggu & Libur Nasional)
  static int calculateWorkdays(DateTime start, DateTime end) {
    int count = 0;
    DateTime cur = DateTime(start.year, start.month, start.day);
    final target = DateTime(end.year, end.month, end.day);

    while (!cur.isAfter(target)) {
      final key = formatDateKey(cur);
      final isSunday = cur.weekday == DateTime.sunday;
      final isHoliday = nationalHolidays.containsKey(key);

      if (!isSunday && !isHoliday) {
        count++;
      }
      cur = cur.add(const Duration(days: 1));
    }
    return count > 0 ? count : 1;
  }

  const KaiRangeCalendarPicker({
    super.key,
    this.initialStartDate,
    this.initialEndDate,
    this.existingLeaves = const [],
    required this.onRangeSelected,
  });

  @override
  State<KaiRangeCalendarPicker> createState() => _KaiRangeCalendarPickerState();
}

class _KaiRangeCalendarPickerState extends State<KaiRangeCalendarPicker> {
  late DateTime _focusedMonth;
  DateTime? _startDate;
  DateTime? _endDate;

  // Nama Bulan Indonesia (Tahan crash tanpa dependensi runtime locale)
  static const _monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  static String _formatMonthYear(DateTime dt) {
    return '${_monthNames[dt.month - 1]} ${dt.year}';
  }

  @override
  void initState() {
    super.initState();
    _startDate = widget.initialStartDate ?? DateTime.now();
    _endDate = widget.initialEndDate ?? _startDate;
    _focusedMonth = DateTime(_startDate!.year, _startDate!.month, 1);
  }

  @override
  void didUpdateWidget(covariant KaiRangeCalendarPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialStartDate != null && widget.initialStartDate != _startDate) {
      _startDate = widget.initialStartDate;
      if (_focusedMonth.year != _startDate!.year || _focusedMonth.month != _startDate!.month) {
        _focusedMonth = DateTime(_startDate!.year, _startDate!.month, 1);
      }
    }
    if (widget.initialEndDate != null && widget.initialEndDate != _endDate) {
      _endDate = widget.initialEndDate;
    }
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  void _onDayTapped(DateTime day) {
    setState(() {
      // Jika rentang sudah lengkap atau belum pilih, klik pertama set start & end ke hari itu (1 hari)
      if (_startDate == null || (_startDate != null && _endDate != null && !_isSameDay(_startDate!, _endDate!))) {
        _startDate = day;
        _endDate = day;
      } else if (_startDate != null && _endDate != null && _isSameDay(_startDate!, _endDate!)) {
        // Klik kedua: jika hari kedua sebelum tanggal mulai, reset ke tanggal mulai baru
        if (day.isBefore(_startDate!)) {
          _startDate = day;
          _endDate = day;
        } else {
          _endDate = day;
        }
      } else {
        _startDate = day;
        _endDate = day;
      }
    });

    final workdays = KaiRangeCalendarPicker.calculateWorkdays(_startDate!, _endDate!);
    widget.onRangeSelected(_startDate!, _endDate!, workdays);
  }

  @override
  Widget build(BuildContext context) {
    final monthName = _formatMonthYear(_focusedMonth);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bulan & Navigasi
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  monthName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left_rounded, size: 22),
                      splashRadius: 18,
                      onPressed: () {
                        setState(() {
                          _focusedMonth = DateTime(
                            _focusedMonth.year,
                            _focusedMonth.month - 1,
                            1,
                          );
                        });
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right_rounded, size: 22),
                      splashRadius: 18,
                      onPressed: () {
                        setState(() {
                          _focusedMonth = DateTime(
                            _focusedMonth.year,
                            _focusedMonth.month + 1,
                            1,
                          );
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Header Nama Hari (Sen - Min)
          _buildWeekdayHeader(),
          const SizedBox(height: 6),

          // Grid Kalender Tanggal
          _buildMonthGrid(),
          const SizedBox(height: 14),
        ],
      ),
    );
  }

  Widget _buildWeekdayHeader() {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: days.map((day) {
          final isSunday = day == 'Min';
          return Expanded(
            child: Center(
              child: Text(
                day,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isSunday ? AppTheme.error : AppTheme.textSecondary,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMonthGrid() {
    final year = _focusedMonth.year;
    final month = _focusedMonth.month;
    final firstDayOfMonth = DateTime(year, month, 1);
    final daysInMonth = DateUtils.getDaysInMonth(year, month);

    // DateTime.weekday: 1=Senin, 7=Minggu
    final leadingEmpty = firstDayOfMonth.weekday - 1;
    final totalCells = leadingEmpty + daysInMonth;
    final totalRows = (totalCells / 7).ceil();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: List.generate(totalRows, (rowIndex) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2.0),
            child: Row(
              children: List.generate(7, (colIndex) {
                final cellIndex = rowIndex * 7 + colIndex;
                final dayNumber = cellIndex - leadingEmpty + 1;

                if (dayNumber < 1 || dayNumber > daysInMonth) {
                  return const Expanded(child: SizedBox(height: 40));
                }

                final date = DateTime(year, month, dayNumber);
                return Expanded(child: _buildDayCell(date));
              }),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildDayCell(DateTime date) {
    final dateKey = KaiRangeCalendarPicker.formatDateKey(date);
    final isSunday = date.weekday == DateTime.sunday;
    final isHoliday = KaiRangeCalendarPicker.nationalHolidays.containsKey(dateKey);

    final isStart = _startDate != null && _isSameDay(date, _startDate!);
    final isEnd = _endDate != null && _isSameDay(date, _endDate!);
    final isInRange = _startDate != null &&
        _endDate != null &&
        date.isAfter(_startDate!) &&
        date.isBefore(_endDate!);

    final isSelected = isStart || isEnd || isInRange;

    Color textColor;
    if (isSelected) {
      textColor = Colors.white;
    } else if (isHoliday || isSunday) {
      textColor = AppTheme.error;
    } else {
      textColor = AppTheme.textPrimary;
    }

    final isWeekStart = date.weekday == DateTime.monday;
    final isWeekEnd = date.weekday == DateTime.sunday;

    // Range continuous strip decoration (Semua tanggal terpilih seragam)
    BoxDecoration? rangeDecoration;
    if (isStart && isEnd) {
      rangeDecoration = const BoxDecoration(
        color: AppTheme.primary,
        shape: BoxShape.circle,
      );
    } else if (isStart) {
      rangeDecoration = BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.horizontal(
          left: const Radius.circular(20),
          right: isWeekEnd ? const Radius.circular(20) : Radius.zero,
        ),
      );
    } else if (isEnd) {
      rangeDecoration = BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.horizontal(
          left: isWeekStart ? const Radius.circular(20) : Radius.zero,
          right: const Radius.circular(20),
        ),
      );
    } else if (isInRange) {
      rangeDecoration = BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.horizontal(
          left: isWeekStart ? const Radius.circular(20) : Radius.zero,
          right: isWeekEnd ? const Radius.circular(20) : Radius.zero,
        ),
      );
    }

    return GestureDetector(
      onTap: () => _onDayTapped(date),
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 40,
        decoration: rangeDecoration,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Angka Tanggal
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${date.day}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected || isHoliday
                        ? FontWeight.w800
                        : FontWeight.w600,
                    color: textColor,
                  ),
                ),
                // Titik penanda Hari Libur / Minggu
                if (!isSelected && isHoliday)
                  Container(
                    width: 4,
                    height: 4,
                    margin: const EdgeInsets.only(top: 2),
                    decoration: const BoxDecoration(
                      color: AppTheme.error,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
