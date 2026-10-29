import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class AttendanceHeroCard extends StatefulWidget {
  final int presenceDays;
  final int sickCount;
  final int leaveQuota;
  final String? checkInTime;
  final String? checkOutTime;
  final VoidCallback onCheckInTap;
  final VoidCallback onCheckOutTap;

  const AttendanceHeroCard({
    super.key,
    required this.presenceDays,
    required this.sickCount,
    required this.leaveQuota,
    this.checkInTime,
    this.checkOutTime,
    required this.onCheckInTap,
    required this.onCheckOutTap,
  });

  @override
  State<AttendanceHeroCard> createState() => _AttendanceHeroCardState();
}

class _AttendanceHeroCardState extends State<AttendanceHeroCard> {
  late Timer _timer;
  int _secondsWorked = 5 * 3600 + 3 * 60 + 24;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _secondsWorked++;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatDuration(int totalSeconds) {
    final h = (totalSeconds ~/ 3600).toString().padLeft(2, '0');
    final m = ((totalSeconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final s = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Corporate Brand Banner (Deep Forest)
          Container(
            width: double.infinity,
            color: AppTheme.primary,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            child: const Center(
              child: Text(
                'PT. Nutrilife Sejahtera Indonesia',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Triad Metrics
                Row(
                  children: [
                    _buildMetricCol('Presence', '${widget.presenceDays} Days'),
                    Container(height: 28, width: 1, color: AppTheme.border),
                    _buildMetricCol('Sick', '${widget.sickCount} Times'),
                    Container(height: 28, width: 1, color: AppTheme.border),
                    _buildMetricCol('Leave Quota', '${widget.leaveQuota} Days'),
                  ],
                ),
                const SizedBox(height: 10),

                // Pagination Indicator Pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 16,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      width: 5,
                      height: 5,
                      decoration: BoxDecoration(
                        color: AppTheme.borderSubtle,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Elapsed Work Timer Counter
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Duration',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceAlt,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Text(
                        _formatDuration(_secondsWorked),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                          fontFamily: 'monospace',
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Dual Action Check-in / Check-out Cards
                Row(
                  children: [
                    // Check-in Button Card
                    Expanded(
                      child: InkWell(
                        onTap: widget.onCheckInTap,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: AppTheme.secondarySubtle,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppTheme.secondary.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.login_rounded,
                                  size: 18,
                                  color: AppTheme.primary,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.checkInTime ?? '08:00',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: AppTheme.textPrimary,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    'Checkin',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Check-out Button Card
                    Expanded(
                      child: InkWell(
                        onTap: widget.onCheckOutTap,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: AppTheme.errorSubtle,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppTheme.error.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.logout_rounded,
                                  size: 18,
                                  color: AppTheme.error,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.checkOutTime ?? '--:--',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w800,
                                      color: widget.checkOutTime != null
                                          ? AppTheme.error
                                          : AppTheme.textMuted,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    'Checkout',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCol(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
