import 'package:flutter/material.dart';
import '../../../models/attendance_model.dart';

class RecentAttendanceItem extends StatelessWidget {
  final AttendanceModel item;

  const RecentAttendanceItem({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final isOntime = item.status == 'TEPAT_WAKTU';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: isOntime
                  ? const Color(0xFFDCFCE7)
                  : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isOntime
                  ? Icons.check_circle_outline
                  : Icons.access_time,
              color: isOntime
                  ? const Color(0xFF16A34A)
                  : const Color(0xFFD97706),
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
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Masuk: ${item.checkInTime} • Jarak: ${item.checkInDistanceMeters.toStringAsFixed(1)}m',
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isOntime
                  ? const Color(0xFFDCFCE7)
                  : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isOntime ? 'Tepat Waktu' : 'Terlambat',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isOntime
                    ? const Color(0xFF15803D)
                    : const Color(0xFFB45309),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
