import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class ShiftTimelineView extends StatelessWidget {
  const ShiftTimelineView({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Continuous Track Line
        Positioned(
          left: 56,
          top: 24,
          bottom: 24,
          child: Container(
            width: 2,
            color: const Color(0xFFFECDD3),
          ),
        ),

        // Shifts List
        Column(
          children: [
            _buildShiftNode(
              time: '07:35',
              dotColor: const Color(0xFFC81E1E),
              ringColor: const Color(0xFFFFE4E6),
              cardBg: AppTheme.roseSubtle,
              cardBorder: AppTheme.roseBorder,
              title: 'Morning shift',
              accentColor: const Color(0xFFC81E1E),
              scheduleSubtitle: 'Scheduled',
              durationText: '07:35 : 09:35 (2hour)',
            ),
            const SizedBox(height: 16),
            _buildShiftNode(
              time: '13:30',
              dotColor: AppTheme.accent,
              ringColor: const Color(0xFFFEF3C7),
              cardBg: AppTheme.amberSubtle,
              cardBorder: AppTheme.amberBorder,
              title: 'Afternoon shift',
              accentColor: AppTheme.accent,
              scheduleSubtitle: 'Scheduled',
              durationText: '13:30 : 15:30 (2hour)',
            ),
            const SizedBox(height: 16),
            _buildShiftNode(
              time: '17:35',
              dotColor: AppTheme.info,
              ringColor: const Color(0xFFE0F2FE),
              cardBg: AppTheme.skySubtle,
              cardBorder: AppTheme.skyBorder,
              title: 'Night shift',
              accentColor: AppTheme.info,
              scheduleSubtitle: '17:35 : 19:35 (1hour)',
              location: 'Kantor Pusat - Jakarta',
              note: 'Regular Schedule',
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
