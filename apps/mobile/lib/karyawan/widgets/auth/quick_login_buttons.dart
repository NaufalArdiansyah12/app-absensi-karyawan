import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class QuickLoginButtons extends StatelessWidget {
  final void Function(String nik, String password) onSelect;

  const QuickLoginButtons({super.key, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Container(
                height: 1,
                color: AppTheme.border,
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                'Akses Cepat Pengujian',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
            Expanded(
              child: Container(
                height: 1,
                color: AppTheme.border,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: _buildQuickPill(
                initials: 'AF',
                name: 'Ahmad Fauzi',
                role: 'Staff Ops',
                avatarBg: AppTheme.primarySubtle,
                textColor: AppTheme.primary,
                onTap: () => onSelect('EMP001', 'karyawan123'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickPill(
                initials: 'RP',
                name: 'Rian Pratama',
                role: 'Staff Gudang',
                avatarBg: AppTheme.secondarySubtle,
                textColor: AppTheme.secondary,
                onTap: () => onSelect('EMP002', 'karyawan123'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickPill({
    required String initials,
    required String name,
    required String role,
    required Color avatarBg,
    required Color textColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.surfaceAlt,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: avatarBg,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    role,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
