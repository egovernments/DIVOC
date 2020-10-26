import 'package:divoc/base/routes.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_page.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_portal/flutter_portal.dart';
import 'package:provider/provider.dart';

class ProviderApp extends StatelessWidget {
  final AuthRepository repository;

  ProviderApp({
    @required this.repository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => repository),
      ],
      child: Portal(
        child: MaterialApp(
          theme: DivocTheme.appTheme,
          localizationsDelegates: [
            DivocLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate
          ],
          supportedLocales: [Locale('en', ''), Locale('hi', '')],
          home: CustomNavigatorScreen(),
          routes: {
            DivocRoutes.home: (context) => HomePage(),
            DivocRoutes.login: (context) => LoginPage(),
          },
        ),
      ),
    );
  }
}
