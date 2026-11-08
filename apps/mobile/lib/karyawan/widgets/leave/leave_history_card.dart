import 'package:flutter/material.dart';
import '../../../models/leave_model.dart';
import '../../../../theme/app_theme.dart';

class LeaveHistoryCard extends StatelessWidget {
  final LeaveModel item;

  const LeaveHistoryCard({super.key, required this.item});

  Color _getStatusBg(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return AppTheme.amberSubtle;
      case 'MENUNGGU_HR':
        return AppTheme.infoSubtle;
      case 'FINAL_DISETUJUI':
        return AppTheme.secondarySubtle;
      case 'DITOLAK_GM':
      case 'DITOLAK_HR':
        return AppTheme.errorSubtle;
      default:
        return AppTheme.surfaceAlt;
    }
  }

  Color _getStatusTextColor(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return const Color(0xFFB45309);
      case 'MENUNGGU_HR':
        return AppTheme.info;
      case 'FINAL_DISETUJUI':
        return AppTheme.secondary;
      case 'DITOLAK_GM':
      case 'DITOLAK_HR':
        return AppTheme.error;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _formatStatusLabel(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return 'Menunggu GM';
      case 'MENUNGGU_HR':
        return 'Menunggu HR';
      case 'FINAL_DISETUJUI':
        return 'Disetujui Final';
      case 'DITOLAK_GM':
        return 'Ditolak GM';
      case 'DITOLAK_HR':
        return 'Ditolak HR';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRejected = item.status.startsWith('DITOLAK');
    final isFinalApproved = item.status == 'FINAL_DISETUJUI';
    final isWaitingHr = item.status == 'MENUNGGU_HR';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Tipe & Badge Status
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    item.type == 'IZIN_SAKIT'
                        ? Icons.medical_services_outlined
                        : Icons.event_available_rounded,
                    size: 16,
                    color: item.type == 'IZIN_SAKIT'
                        ? AppTheme.accent
                        : AppTheme.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    item.type.replaceAll('_', ' '),
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusBg(item.status),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _getStatusTextColor(item.status).withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  _formatStatusLabel(item.status),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: _getStatusTextColor(item.status),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Tanggal & Alasan
          Text(
            '${item.startDate} s/d ${item.endDate} (${item.durationDays} Hari Kerja)',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 2),
          Text(
            'Alasan: "${item.reason}"',
            style: const TextStyle(
              fontSize: 11,
              fontStyle: FontStyle.italic,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 12),

          // Visual 2-Tier Stepper Progress
          _buildTwoTierStepper(
            isWaitingHr: isWaitingHr,
            isFinalApproved: isFinalApproved,
            isRejected: isRejected,
          ),

          // Catatan GM / HR jika ada
          if (item.gmNote != null && item.gmNote!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.amberSubtle,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.note_alt_outlined, size: 12, color: Color(0xFF92400E)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Catatan GM: ${item.gmNote}',
                        style: const TextStyle(fontSize: 10, color: Color(0xFF92400E), fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (item.hrNote != null && item.hrNote!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.infoSubtle,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.note_alt_outlined, size: 12, color: AppTheme.info),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Catatan HR: ${item.hrNote}',
                        style: const TextStyle(fontSize: 10, color: AppTheme.info, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  // Visual Stepper 3 Langkah
  Widget _buildTwoTierStepper({
    required bool isWaitingHr,
    required bool isFinalApproved,
    required bool isRejected,
  }) {
    final gmStepCompleted = isWaitingHr || isFinalApproved;
    final hrStepCompleted = isFinalApproved;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
      decoration: BoxDecoration(
        color: AppTheme.surfaceAlt,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          // Step 1: Diajukan
          _buildStepNode(label: 'Diajukan', isDone: true, isCurrent: false),
          _buildStepConnector(isDone: gmStepCompleted),

          // Step 2: GM Review
          _buildStepNode(
            label: 'Review GM',
            isDone: gmStepCompleted,
            isCurrent: item.status == 'MENUNGGU_GM',
            isError: item.status == 'DITOLAK_GM',
          ),
          _buildStepConnector(isDone: hrStepCompleted),

          // Step 3: HR Final
          _buildStepNode(
            label: 'Final HR',
            isDone: hrStepCompleted,
            isCurrent: isWaitingHr,
            isError: item.status == 'DITOLAK_HR',
          ),
        ],
      ),
    );
  }

  Widget _buildStepNode({
    required String label,
    required bool isDone,
    required bool isCurrent,
    bool isError = false,
  }) {
    Color bg;
    Widget icon;

    if (isError) {
      bg = AppTheme.error;
      icon = const Icon(Icons.close_rounded, size: 10, color: Colors.white);
    } else if (isDone) {
      bg = AppTheme.secondary;
      icon = const Icon(Icons.check_rounded, size: 10, color: Colors.white);
    } else if (isCurrent) {
      bg = AppTheme.primary;
      icon = const Icon(Icons.hourglass_top_rounded, size: 10, color: Colors.white);
    } else {
      bg = AppTheme.borderSubtle;
      icon = const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
          child: Center(child: icon),
        ),
        const SizedBox(height: 3),
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: isCurrent || isDone ? FontWeight.w700 : FontWeight.w500,
            color: isError
                ? AppTheme.error
                : (isDone || isCurrent ? AppTheme.textPrimary : AppTheme.textMuted),
          ),
        ),
      ],
    );
  }

  Widget _buildStepConnector({required bool isDone}) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 12, left: 4, right: 4),
        color: isDone ? AppTheme.secondary : AppTheme.border,
      ),
    );
  }
}
