import 'package:flutter/material.dart';
import '../../../models/user_model.dart';
import '../../../../theme/app_theme.dart';

class ShiftTimelineView extends StatelessWidget {
  final UserModel? currentUser;
  final DateTime? selectedDate;

  const ShiftTimelineView({
    super.key,
    this.currentUser,
    this.selectedDate,
  });

  @override
  Widget build(BuildContext context) {
    final date = selectedDate ?? DateTime.now();
    final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;

    if (isWeekend) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: AppTheme.surfaceAlt,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.weekend_rounded, size: 36, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 12),
            const Text(
              'Libur Akhir Pekan',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Tidak ada jadwal kerja aktif untuk hari ini.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }

    final shiftName = currentUser?.shiftName?.trim().isNotEmpty == true
        ? currentUser!.shiftName!
        : 'Shift Reguler';
    final shiftHours = currentUser?.shiftHours?.trim().isNotEmpty == true
        ? currentUser!.shiftHours!
        : '08:00 - 17:00 WIB';
    final breakHours = currentUser?.shiftBreakHours?.trim().isNotEmpty == true
        ? currentUser!.shiftBreakHours!
        : '12:00 - 13:00 WIB';

    final startTime = shiftHours.split(' ').first;
    final breakStartTime = breakHours.split(' ').first;

    return Stack(
      children: [
        // Continuous Track Line
        Positioned(
          left: 56,
          top: 24,
          bottom: 24,
          child: Container(
            width: 2,
            color: const Color(0xFFE2E8F0),
          ),
        ),

        // Dynamic Shifts List
        Column(
          children: [
            _buildShiftNode(
              time: startTime,
              dotColor: AppTheme.primary,
              ringColor: AppTheme.primarySubtle,
              cardBg: AppTheme.surface,
              cardBorder: AppTheme.border,
              title: shiftName,
              accentColor: AppTheme.primary,
              scheduleSubtitle: 'Jadwal Kerja Aktif',
              durationText: shiftHours,
              location: 'Kantor Pusat Nutrilife',
              note: 'Wajib melakukan GPS Face check-in sebelum masuk kerja.',
            ),
            const SizedBox(height: 16),
            _buildShiftNode(
              time: breakStartTime,
              dotColor: AppTheme.accent,
              ringColor: const Color(0xFFFEF3C7),
              cardBg: AppTheme.amberSubtle,
              cardBorder: AppTheme.amberBorder,
              title: 'Waktu Istirahat',
              accentColor: AppTheme.accent,
              scheduleSubtitle: 'Istirahat Reguler',
              durationText: breakHours,
              note: 'Gunakan waktu istirahat secara proporsional.',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildShiftNode({
    required String time,
    required Color dotColor,
    required Color ringColor,
    required Color cardBg,
    required Color cardBorder,
    required String title,
    required Color accentColor,
    required String scheduleSubtitle,
    String? durationText,
    String? location,
    String? note,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Time & Node Marker
        SizedBox(
          width: 66,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                time,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'monospace',
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: dotColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: ringColor, width: 2),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),

        // Shift Card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: accentColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const Icon(
                      Icons.more_horiz_rounded,
                      size: 16,
                      color: AppTheme.textSecondary,
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 14, top: 2),
                  child: Text(
                    scheduleSubtitle,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
                if (durationText != null) ...[
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.only(left: 14),
                    child: Row(
                      children: [
                        Icon(Icons.watch_later_outlined, size: 13, color: accentColor),
                        const SizedBox(width: 6),
                        Text(
                          durationText,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (location != null) ...[
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.only(left: 14),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, size: 13, color: AppTheme.primary),
                        const SizedBox(width: 4),
                        Text(
                          location,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (note != null) ...[
                  Padding(
                    padding: const EdgeInsets.only(left: 31, top: 2),
                    child: Text(
                      note,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
