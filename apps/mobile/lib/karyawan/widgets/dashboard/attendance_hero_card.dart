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
  Timer? _timer;
  int _secondsWorked = 0;
  bool _isRunning = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void didUpdateWidget(covariant AttendanceHeroCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.checkInTime != widget.checkInTime ||
        oldWidget.checkOutTime != widget.checkOutTime) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  DateTime? _parseTodayTime(String? timeStr) {
    if (timeStr == null || timeStr.trim().isEmpty || timeStr == '--:--') {
      return null;
    }
    try {
      final parts = timeStr.trim().split(':');
      if (parts.length >= 2) {
        final now = DateTime.now();
        final h = int.parse(parts[0]);
        final m = int.parse(parts[1]);
        final s = parts.length >= 3 ? int.parse(parts[2]) : 0;
        return DateTime(now.year, now.month, now.day, h, m, s);
      }
    } catch (_) {}
    return null;
  }

  void _calculateSeconds() {
    final inTime = _parseTodayTime(widget.checkInTime);
    if (inTime == null) {
      _secondsWorked = 0;
      _isRunning = false;
      return;
    }

    final outTime = _parseTodayTime(widget.checkOutTime);
    if (outTime != null) {
      final diff = outTime.difference(inTime).inSeconds;
      _secondsWorked = diff > 0 ? diff : 0;
      _isRunning = false;
    } else {
      final now = DateTime.now();
      final diff = now.difference(inTime).inSeconds;
      _secondsWorked = diff > 0 ? diff : 0;
      _isRunning = true;
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _calculateSeconds();
    if (_isRunning) {
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) return;
        setState(() {
          _calculateSeconds();
        });
      });
    }
  }

  String _formatDuration(int totalSeconds) {
    final h = (totalSeconds ~/ 3600).toString().padLeft(2, '0');
    final m = ((totalSeconds % 3600) ~/ 60).toString().padLeft(2, '0');
    final s = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  String _formatTimeDisplay(String? raw) {
    if (raw == null || raw.trim().isEmpty || raw == '--:--') {
      return '--:--';
    }
    final parts = raw.split(':');
    if (parts.length >= 2) {
      return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
    }
    return raw;
  }

  @override
  Widget build(BuildContext context) {
    final hasCheckedIn = widget.checkInTime != null && widget.checkInTime!.isNotEmpty;
    final hasCheckedOut = widget.checkOutTime != null && widget.checkOutTime!.isNotEmpty;

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
                    _buildMetricCol('Kehadiran', '${widget.presenceDays} Hari'),
                    Container(height: 28, width: 1, color: AppTheme.border),
                    _buildMetricCol('Izin Sakit', '${widget.sickCount} Kali'),
                    Container(height: 28, width: 1, color: AppTheme.border),
                    _buildMetricCol('Sisa Cuti', '${widget.leaveQuota} Hari'),
                  ],
                ),
                const SizedBox(height: 12),

                // Elapsed Work Timer Counter
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isRunning)
                      Container(
                        width: 7,
                        height: 7,
                        margin: const EdgeInsets.only(right: 6),
                        decoration: const BoxDecoration(
                          color: AppTheme.secondary,
                          shape: BoxShape.circle,
                        ),
                      ),
                    Text(
                      _isRunning ? 'Jam Kerja (Berjalan)' : 'Durasi Kerja',
                      style: const TextStyle(
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
                        color: _isRunning ? AppTheme.primarySubtle : AppTheme.surfaceAlt,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _isRunning
                              ? AppTheme.primary.withValues(alpha: 0.3)
                              : AppTheme.borderSubtle,
                        ),
                      ),
                      child: Text(
                        _formatDuration(_secondsWorked),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: _isRunning ? AppTheme.primary : AppTheme.textPrimary,
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
                            color: hasCheckedIn
                                ? AppTheme.primarySubtle.withValues(alpha: 0.4)
                                : AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: hasCheckedIn
                                  ? AppTheme.secondary.withValues(alpha: 0.4)
                                  : AppTheme.border,
                            ),
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
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _formatTimeDisplay(widget.checkInTime),
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: hasCheckedIn
                                            ? AppTheme.primary
                                            : AppTheme.textMuted,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Masuk',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
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
                            color: hasCheckedOut
                                ? AppTheme.errorSubtle.withValues(alpha: 0.4)
                                : AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: hasCheckedOut
                                  ? AppTheme.error.withValues(alpha: 0.4)
                                  : AppTheme.border,
                            ),
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
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _formatTimeDisplay(widget.checkOutTime),
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: hasCheckedOut
                                            ? AppTheme.error
                                            : AppTheme.textMuted,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    const Text(
                                      'Pulang',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
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
