import 'package:flutter/material.dart';
import '../../../models/attendance_model.dart';
import '../../../../theme/app_theme.dart';

class HistoryPreviewSection extends StatelessWidget {
  final List<AttendanceModel> attendances;
  final bool isLoading;
  final VoidCallback onSyncAll;
  final VoidCallback onSeeMore;

  const HistoryPreviewSection({
    super.key,
    required this.attendances,
    required this.isLoading,
    required this.onSyncAll,
    required this.onSeeMore,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'History',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            InkWell(
              onTap: onSeeMore,
              child: const Text(
                'See More',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Sync All Pill Button
        Center(
          child: InkWell(
            onTap: onSyncAll,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppTheme.primary.withValues(alpha: 0.3),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 4,
                  )
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.refresh_rounded,
                    size: 14,
                    color: AppTheme.primary,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Sync All',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Items
        if (isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(color: AppTheme.primary),
            ),
          )
        else if (attendances.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.border),
            ),
            child: const Center(
              child: Text(
                'Belum ada catatan absensi tersinkron.',
                style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: attendances.length > 5 ? 5 : attendances.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final item = attendances[index];
              final isCompleted = item.checkOutTime != null && item.checkOutTime!.isNotEmpty;
              final badgeLabel = isCompleted ? 'Completed' : 'Present';

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? AppTheme.surfaceAlt
                            : AppTheme.primarySubtle,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isCompleted
                              ? AppTheme.border
                              : AppTheme.primary.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          isCompleted ? 'OK' : 'UP',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: isCompleted
                                ? AppTheme.textPrimary
                                : AppTheme.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.date,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(
                                Icons.access_time_rounded,
                                size: 11,
                                color: AppTheme.textSecondary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isCompleted
                                    ? '${item.checkInTime} — ${item.checkOutTime}'
                                    : '${item.checkInTime} — In Progress',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppTheme.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? AppTheme.surfaceAlt
                            : AppTheme.primarySubtle,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isCompleted
                              ? AppTheme.border
                              : AppTheme.primary.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        badgeLabel,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: isCompleted
                              ? AppTheme.textSecondary
                              : AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }
}
