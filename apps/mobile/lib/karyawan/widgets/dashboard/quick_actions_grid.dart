import 'package:flutter/material.dart';

class QuickActionsGrid extends StatelessWidget {
  final VoidCallback onAttendanceTap;
  final VoidCallback onLeaveTap;
  final VoidCallback onPayslipTap;

  const QuickActionsGrid({
    super.key,
    required this.onAttendanceTap,
    required this.onLeaveTap,
    required this.onPayslipTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildMenuCard(
            icon: Icons.camera_alt_outlined,
            title: 'Presensi GPS',
            subtitle: 'Foto & Lokasi',
            color: const Color(0xFF0284C7),
            onTap: onAttendanceTap,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildMenuCard(
            icon: Icons.calendar_month_outlined,
            title: 'Permohonan Cuti',
            subtitle: 'Alur 2-Tier GM→HR',
            color: const Color(0xFF7C3AED),
            onTap: onLeaveTap,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildMenuCard(
            icon: Icons.receipt_long_outlined,
            title: 'Slip Gaji',
            subtitle: 'Rekap Bulanan',
            color: const Color(0xFF059669),
            onTap: onPayslipTap,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 11,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 9,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
