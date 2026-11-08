import 'package:flutter/material.dart';
import '../../../models/leave_model.dart';
import '../../../../theme/app_theme.dart';

class EmployeeInfoHubSection extends StatelessWidget {
  final int monthlyPresenceDays;
  final int sickLeaveCount;
  final int leaveQuota;
  final List<LeaveModel> recentLeaves;
  final VoidCallback onNavigateToSchedule;
  final VoidCallback onNavigateToLeaves;
  final VoidCallback onAnnouncementTap;

  const EmployeeInfoHubSection({
    super.key,
    required this.monthlyPresenceDays,
    required this.sickLeaveCount,
    required this.leaveQuota,
    required this.recentLeaves,
    required this.onNavigateToSchedule,
    required this.onNavigateToLeaves,
    required this.onAnnouncementTap,
  });

  @override
  Widget build(BuildContext context) {
    final latestLeave = recentLeaves.isNotEmpty ? recentLeaves.first : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Title
        const Row(
          children: [
            Icon(Icons.dashboard_customize_rounded, size: 18, color: AppTheme.primary),
            SizedBox(width: 8),
            Text(
              'Pusat Informasi & Aktivitas',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // 1. Kartu Jadwal Shift Hari Ini
        _buildTodayShiftCard(),
        const SizedBox(height: 12),

        // 2. Kartu Status Pengajuan Cuti / Izin Terkini
        _buildRecentLeaveCard(latestLeave),
        const SizedBox(height: 12),

        // 3. Banner Pengumuman & Memo HR
        _buildHrAnnouncementBanner(),
        const SizedBox(height: 12),

        // 4. Ringkasan Metrik Jam Kerja & Hak Karyawan
        _buildMetricsGrid(),
      ],
    );
  }

  Widget _buildTodayShiftCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.schedule_rounded, size: 16, color: AppTheme.primary),
                  SizedBox(width: 6),
                  Text(
                    'Jadwal Shift Hari Ini',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.secondarySubtle,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.secondary.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'Shift Normal',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.secondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildShiftItem(
                  icon: Icons.access_time_filled_rounded,
                  label: 'Jam Kerja',
                  value: '08:00 - 17:00 WIB',
                ),
              ),
              Container(width: 1, height: 32, color: AppTheme.border),
              Expanded(
                child: _buildShiftItem(
                  icon: Icons.coffee_rounded,
                  label: 'Istirahat',
                  value: '12:00 - 13:00 WIB',
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: AppTheme.border),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.business_rounded, size: 14, color: AppTheme.textSecondary),
                  SizedBox(width: 6),
                  Text(
                    'Kantor Pusat Nutrilife',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              InkWell(
                onTap: onNavigateToSchedule,
                child: const Text(
                  'Lihat Kalender →',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShiftItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppTheme.primarySubtle,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 14, color: AppTheme.primary),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                ),
                Text(
                  value,
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
      ),
    );
  }

  Widget _buildRecentLeaveCard(LeaveModel? leave) {
    if (leave == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: AppTheme.surfaceAlt,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.assignment_turned_in_outlined,
                  size: 20, color: AppTheme.textSecondary),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tidak Ada Pengajuan Aktif',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Semua pengajuan cuti & izin Anda telah selesai.',
                    style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.border),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              ),
              onPressed: onNavigateToLeaves,
              child: const Text('Ajukan', style: TextStyle(fontSize: 11)),
            ),
          ],
        ),
      );
    }

    Color statusColor;
    Color statusBg;
    String statusText;

    switch (leave.status) {
      case 'MENUNGGU_GM':
        statusColor = AppTheme.accent;
        statusBg = AppTheme.accentSubtle;
        statusText = 'Menunggu GM';
        break;
      case 'MENUNGGU_HR':
        statusColor = AppTheme.info;
        statusBg = AppTheme.infoSubtle;
        statusText = 'Menunggu HR';
        break;
      case 'FINAL_DISETUJUI':
        statusColor = AppTheme.secondary;
        statusBg = AppTheme.secondarySubtle;
        statusText = 'Disetujui';
        break;
      case 'DITOLAK':
        statusColor = AppTheme.error;
        statusBg = AppTheme.errorSubtle;
        statusText = 'Ditolak';
        break;
      default:
        statusColor = AppTheme.textMuted;
        statusBg = AppTheme.surfaceAlt;
        statusText = leave.status;
    }

    final typeLabel = leave.type.replaceAll('_', ' ');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.event_note_rounded, size: 16, color: AppTheme.primary),
                  const SizedBox(width: 6),
                  Text(
                    typeLabel,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Periode: ${leave.startDate} s/d ${leave.endDate} (${leave.durationDays} hari)',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Alasan: "${leave.reason}"',
            style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildHrAnnouncementBanner() {
    return InkWell(
      onTap: onAnnouncementTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.primarySubtle,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.campaign_rounded,
                color: AppTheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'PENGUMUMAN HRD',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(width: 6),
                      Text('•', style: TextStyle(color: AppTheme.textMuted)),
                      SizedBox(width: 6),
                      Text(
                        'Info Terbaru',
                        style: TextStyle(fontSize: 9, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Penyesuaian Jam Kerja & Sosialisasi Shift',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Mohon seluruh karyawan memperhatikan cut-off presensi akhir bulan.',
                    style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppTheme.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricsGrid() {
    return Row(
      children: [
        Expanded(
          child: _buildMetricTile(
            title: 'Hadir Bulan Ini',
            value: '$monthlyPresenceDays',
            unit: 'Hari',
            color: AppTheme.primary,
            icon: Icons.event_available_rounded,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricTile(
            title: 'Sisa Cuti',
            value: '$leaveQuota',
            unit: 'Hari',
            color: AppTheme.secondary,
            icon: Icons.beach_access_rounded,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricTile(
            title: 'Izin Sakit',
            value: '$sickLeaveCount',
            unit: 'Hari',
            color: AppTheme.accent,
            icon: Icons.medical_services_outlined,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required String unit,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textMuted,
                ),
              ),
              Icon(icon, size: 14, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: color,
                ),
              ),
              const SizedBox(width: 3),
              Text(
                unit,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
