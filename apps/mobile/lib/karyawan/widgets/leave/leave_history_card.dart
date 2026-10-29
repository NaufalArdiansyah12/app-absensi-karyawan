import 'package:flutter/material.dart';
import '../../../models/leave_model.dart';

class LeaveHistoryCard extends StatelessWidget {
  final LeaveModel item;

  const LeaveHistoryCard({super.key, required this.item});

  Color _getStatusBg(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return const Color(0xFFFEF3C7);
      case 'MENUNGGU_HR':
        return const Color(0xFFDBEAFE);
      case 'FINAL_DISETUJUI':
        return const Color(0xFFDCFCE7);
      case 'DITOLAK_GM':
      case 'DITOLAK_HR':
        return const Color(0xFFFEE2E2);
      default:
        return const Color(0xFFF1F5F9);
    }
  }

  Color _getStatusTextColor(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return const Color(0xFF92400E);
      case 'MENUNGGU_HR':
        return const Color(0xFF1E40AF);
      case 'FINAL_DISETUJUI':
        return const Color(0xFF166534);
      case 'DITOLAK_GM':
      case 'DITOLAK_HR':
        return const Color(0xFF991B1B);
      default:
        return const Color(0xFF475569);
    }
  }

  String _formatStatusLabel(String status) {
    switch (status) {
      case 'MENUNGGU_GM':
        return 'Menunggu GM';
      case 'MENUNGGU_HR':
        return 'Menunggu HR';
      case 'FINAL_DISETUJUI':
        return 'Disetujui (Final)';
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
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item.type.replaceAll('_', ' '),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Color(0xFF1E293B),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusBg(item.status),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _formatStatusLabel(item.status),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: _getStatusTextColor(item.status),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${item.startDate} s/d ${item.endDate} (${item.durationDays} Hari)',
            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 4),
          Text(
            'Alasan: "${item.reason}"',
            style: const TextStyle(
              fontSize: 11,
              fontStyle: FontStyle.italic,
              color: Color(0xFF475569),
            ),
          ),
          if (item.gmNote != null && item.gmNote!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(
                'Catatan GM: ${item.gmNote}',
                style: const TextStyle(fontSize: 10, color: Color(0xFF92400E)),
              ),
            ),
          if (item.hrNote != null && item.hrNote!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 2.0),
              child: Text(
                'Catatan HR: ${item.hrNote}',
                style: const TextStyle(fontSize: 10, color: Color(0xFF1E40AF)),
              ),
            ),
        ],
      ),
    );
  }
}
