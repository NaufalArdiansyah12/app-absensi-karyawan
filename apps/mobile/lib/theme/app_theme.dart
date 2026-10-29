import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors (DESAIN.md - Deep Forest & Fresh Lime)
  static const Color primary = Color(0xFF0D6838);
  static const Color primaryHover = Color(0xFF094F2A);
  static const Color primarySubtle = Color(0xFFE7F3EC);
  static const Color onPrimary = Color(0xFFFFFFFF);

  static const Color secondary = Color(0xFF68A61C);
  static const Color secondaryHover = Color(0xFF568A16);
  static const Color secondarySubtle = Color(0xFFF0F8E8);
  static const Color onSecondary = Color(0xFFFFFFFF);

  static const Color accent = Color(0xFFF08B00);
  static const Color accentHover = Color(0xFFCC7600);
  static const Color accentSubtle = Color(0xFFFEF4E6);

  static const Color info = Color(0xFF0284C7);
  static const Color infoSubtle = Color(0xFFE0F2FE);

  static const Color background = Color(0xFFF8FAF9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF1F5F3);

  static const Color textPrimary = Color(0xFF1A2E22);
  static const Color textSecondary = Color(0xFF5F7367);
  static const Color textMuted = Color(0xFF8B9D92);

  static const Color border = Color(0xFFE5EBE7);
  static const Color borderSubtle = Color(0xFFD1DCD5);

  static const Color success = Color(0xFF68A61C);
  static const Color error = Color(0xFFDC2626);
  static const Color errorSubtle = Color(0xFFFDF2F2);

  // Pastel shifts for timeline
  static const Color roseSubtle = Color(0xFFFFE5E7);
  static const Color roseBorder = Color(0xFFFECDD3);
  static const Color amberSubtle = Color(0xFFFEF3C7);
  static const Color amberBorder = Color(0xFFFDE68A);
  static const Color skySubtle = Color(0xFFE0F2FE);
  static const Color skyBorder = Color(0xFFBAE6FD);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      fontFamily: 'Roboto',
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surface,
        error: error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
    );
  }
}
