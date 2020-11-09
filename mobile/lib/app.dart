import 'package:divoc/base/routes.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_page.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/home/operator_home_page.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_page.dart';
import 'package:divoc/model/app_session.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_portal/flutter_portal.dart';
import 'package:provider/provider.dart';

class ProviderApp extends StatelessWidget {
  final AuthRepository authRepository;
  final HomeRepository homeRepository;
  final ApiClient apiClient;

  ProviderApp({
    @required this.authRepository,
    @required this.homeRepository,
    @required this.apiClient,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthRepository>(create: (_) => authRepository),
        Provider<ApiClient>(create: (_) => apiClient),
        Provider<HomeRepository>(create: (_) => homeRepository),
        ChangeNotifierProvider(create: (context) => AppSession(authRepository))
      ],
      child: Consumer<AppSession>(
        builder: (context, value, child) => Portal(
          child: MaterialApp(
            theme: DivocTheme.appTheme,
            localizationsDelegates: [
              DivocLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate
            ],
            supportedLocales: [Locale('en', ''), Locale('hi', '')],
            locale: Locale(value.selectedLanguage.code, ''),
            home: buildInitialPage(),
            routes: {
              DivocRoutes.home: (context) => buildInitialPage(),
              DivocRoutes.login: (context) => LoginPage(),
            },
          ),
        ),
      ),
    );
  }

  Widget buildInitialPage() {
    final user = authRepository.currentUser;
    if (user != null) {
      return user.role == 'admin' ? OperatorHomePage() : HomePage();
    }
    return LoginPage();
  }
}
