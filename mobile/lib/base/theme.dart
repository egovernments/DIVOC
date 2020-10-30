import 'package:flutter/material.dart';

class DivocTheme {
  static ThemeData get appTheme {
    final themeData = ThemeData.light();
    final textTheme = themeData.textTheme;
    final body1 = textTheme.body1.copyWith(decorationColor: Colors.transparent);
    return ThemeData(
      primaryColor: Color(0xff88C6A9),
      primaryColorLight: Color(0xffE6FFF4),
      scaffoldBackgroundColor: Color(0xffF0FAF8),
      buttonTheme: ButtonThemeData(
        buttonColor: Color(0xff88C6A9),
        textTheme: ButtonTextTheme.accent,
        colorScheme: themeData.colorScheme.copyWith(
          secondary: Colors.white,
        ),
      ),
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  static ThemeData get loginTheme {
    return appTheme.copyWith(
      scaffoldBackgroundColor: Colors.white,
    );
  }

  static ThemeData get formTheme {
    return appTheme.copyWith(
        buttonTheme: ButtonThemeData(
          textTheme: ButtonTextTheme.accent,
          colorScheme: appTheme.colorScheme.copyWith(
            secondary: Color(0xff646D82),
          ),
        )
    );
  }
}
