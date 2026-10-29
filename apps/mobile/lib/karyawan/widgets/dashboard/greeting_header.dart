import 'package:flutter/material.dart';
import '../../../../theme/app_theme.dart';

class GreetingHeader extends StatelessWidget {
  final String userName;
  final String formattedDate;

  const GreetingHeader({
    super.key,
    required this.userName,
    required this.formattedDate,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Halo, $userName',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(width: 4),
                const Text('👋', style: TextStyle(fontSize: 15)),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              formattedDate,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),

        // Corporate Seal Badge
        Container(
          width: 44,
          height: 44,
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFFCD34D)),
            gradient: const LinearGradient(
              colors: [Color(0xFFFEF3C7), Color(0xFFFFEDD5)],
              begin: Alignment.bottomLeft,
              end: Alignment.topRight,
            ),
          ),
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFD97706),
                style: BorderStyle.solid,
                width: 1,
              ),
            ),
            child: const Center(
              child: Text(
                'CORP\nSEAL',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 7,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF92400E),
                  height: 1.1,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
