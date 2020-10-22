import 'package:divoc/base/routes.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_page.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

class ProviderApp extends StatelessWidget {
  final AuthRepository repository;

  ProviderApp({
    @required this.repository,
  });

  @override
  Widget build(BuildContext context) {
    return Provider(
      create: (_) => repository,
      child: MaterialApp(
        theme: DivocTheme.theme,
        localizationsDelegates: [
          DivocLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate
        ],
        supportedLocales: [Locale('en', ''), Locale('hi', '')],
        onGenerateTitle: (context) => DivocLocalizations.of(context).title,
        home: repository.isLoggedIn ? HomePage() : LoginPage(),
        routes: {
          DivocRoutes.home: (context) => HomePage(),
          DivocRoutes.login: (context) => LoginPage(),
        },
      ),
    );
  }
}
