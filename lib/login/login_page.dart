import 'dart:async';

import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/routes.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_model.dart';
import 'package:divoc/login/login_page_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_portal/flutter_portal.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatelessWidget {
  final GlobalKey<NavigatorState> _navigationState = new GlobalKey();

  @override
  Widget build(BuildContext context) {
    final authRepository = context.watch<AuthRepository>();
    final divocLocalizations = DivocLocalizations.of(context);
    return ChangeNotifierProvider<LoginModel>(
      create: (_) => LoginModel(authRepository),
      child: WillPopScope(
        onWillPop: () async => !await _navigationState.currentState.maybePop(),
        child: Scaffold(
          body: Consumer<LoginModel>(
            builder: (context, loginModel, child) {
              if (!loginModel.isLoading) {
                if (loginModel.currentState == LoginFlow.LOGIN) {
                  scheduleMicrotask(() {
                    _navigationState.currentState.pushNamed(LoginRoute.otp);
                  });
                } else if (loginModel.currentState == LoginFlow.SUCCESS) {
                  scheduleMicrotask(() {
                    Navigator.pushReplacementNamed(context, DivocRoutes.home);
                  });
                }
              }
              return PortalEntry(
                visible: loginModel.isLoading,
                portal: LoadingOverlay(),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: DivocHeader(),
                    ),
                    Expanded(
                      child: Navigator(
                        key: _navigationState,
                        onGenerateRoute: (RouteSettings settings) {
                          if (settings.name == LoginRoute.otp) {
                            return MaterialPageRoute(builder: (context) {
                              return LoginFormPage(
                                LoginOTPDetails(
                                  loginModel,
                                  divocLocalizations,
                                ),
                              );
                            });
                          }
                          return MaterialPageRoute(builder: (context) {
                            return LoginFormPage(
                              LoginMobileDetails(
                                loginModel,
                                divocLocalizations,
                              ),
                            );
                          });
                        },
                      ),
                    ),
                    DivocFooter(),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
