import 'package:flutter/material.dart';

class AppTheme {
  static const _bg = Color(0xFF0B1217);
  static const _surface = Color(0xFF13222B);
  static const _surfaceSoft = Color(0xFF19313D);
  static const _accent = Color(0xFFF06543);
  static const _accent2 = Color(0xFF2BB2A3);
  static const _text = Color(0xFFE7F0F5);
  static const _muted = Color(0xFF89A3B1);

  static ThemeData build() {
    final scheme = ColorScheme.fromSeed(
      seedColor: _accent,
      brightness: Brightness.dark,
      primary: _accent,
      secondary: _accent2,
      surface: _surface,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: _bg,
      cardTheme: CardThemeData(
        color: _surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.4,
          color: _text,
        ),
        titleLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: _text,
        ),
        bodyMedium: TextStyle(
          color: _text,
          fontSize: 14,
          height: 1.35,
        ),
        bodySmall: TextStyle(
          color: _muted,
          fontSize: 12,
        ),
      ),
      chipTheme: ChipThemeData(
        selectedColor: _accent.withOpacity(0.25),
        backgroundColor: _surfaceSoft,
        labelStyle: const TextStyle(color: _text),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: _surfaceSoft,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  static const backgroundGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF081015), Color(0xFF112431), Color(0xFF1A3236)],
    stops: [0.1, 0.55, 1],
  );
}
