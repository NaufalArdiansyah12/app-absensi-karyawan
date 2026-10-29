import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class ActionMatrixGrid extends StatelessWidget {
  final VoidCallback onLeaveTap;
  final VoidCallback onBreakTap;
  final VoidCallback onVisitTap;
  final VoidCallback onOvertimeTap;
  final VoidCallback onApprovalTap;
  final VoidCallback onHistoryLogTap;
  final VoidCallback onReportLogTap;
  final VoidCallback onOthersTap;

  const ActionMatrixGrid({
    super.key,
    required this.onLeaveTap,
    required this.onBreakTap,
    required this.onVisitTap,
    required this.onOvertimeTap,
    required this.onApprovalTap,
    required this.onHistoryLogTap,
    required this.onReportLogTap,
    required this.onOthersTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildTile(
                icon: Icons.event_busy_rounded,
                label: 'Leave',
                bgColor: const Color(0xFFFDF2F2),
                iconColor: const Color(0xFFC81E1E),
                onTap: onLeaveTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.coffee_rounded,
                label: 'Break',
                bgColor: const Color(0xFFFFFBEB),
                iconColor: const Color(0xFFD97706),
                onTap: onBreakTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.location_on_rounded,
                label: 'Visit',
                bgColor: const Color(0xFFECFDF5),
                iconColor: const Color(0xFF059669),
                onTap: onVisitTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.timer_outlined,
                label: 'Overtime',
                bgColor: const Color(0xFFFEF9C3),
                iconColor: const Color(0xFFCA8A04),
                onTap: onOvertimeTap,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildTile(
                icon: Icons.assignment_turned_in_outlined,
                label: 'Approval',
                bgColor: const Color(0xFFEFF6FF),
                iconColor: const Color(0xFF2563EB),
                badge: '2',
                onTap: onApprovalTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.forum_outlined,
                label: 'History Log',
                bgColor: const Color(0xFFFFF7ED),
                iconColor: const Color(0xFFEA580C),
                onTap: onHistoryLogTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.bookmark_added_outlined,
                label: 'Report Log',
                bgColor: const Color(0xFFF0F9FF),
                iconColor: const Color(0xFF0284C7),
                onTap: onReportLogTap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildTile(
                icon: Icons.grid_view_rounded,
                label: 'Others',
                bgColor: const Color(0xFFFDF2F8),
                iconColor: const Color(0xFFDB2777),
                onTap: onOthersTap,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTile({
    required IconData icon,
    required String label,
    required Color bgColor,
    required Color iconColor,
    String? badge,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                if (badge != null)
                  Positioned(
                    top: -3,
                    right: -3,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.error,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: Text(
                        badge,
                        style: const TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
