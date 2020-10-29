import 'dart:async';

import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/routes.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_model.dart';
import 'package:divoc/login/login_form.dart';
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
        child: Theme(
          data: DivocTheme.loginTheme,
          child: Scaffold(
            body: Consumer<LoginModel>(
              builder: (context, loginModel, child) {
                if (loginModel.currentState.status == Status.ERROR) {
                  scheduleMicrotask(() => {
                        Scaffold.of(context).showSnackBar(
                          SnackBar(
                            content: Text(loginModel.currentState.message),
                          ),
                        )
                      });
                } else if (loginModel.currentState.status != Status.LOADING) {
                  if (loginModel.flowState == LoginFlow.LOGIN) {
                    scheduleMicrotask(() {
                      _navigationState.currentState.pushNamed(LoginRoute.otp);
                    });
                  } else if (loginModel.flowState == LoginFlow.SUCCESS) {
                    scheduleMicrotask(() {
                      Navigator.pushReplacementNamed(context, DivocRoutes.home);
                    });
                  }
                }
                return PortalEntry(
                  visible: loginModel.currentState.status == Status.LOADING,
                  portal: LoadingOverlay(),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: DivocHeader(
                          null,
                          showHelpMenu: false,
                          showHeaderMenu: false,
                        ),
                      ),
                      Expanded(
                        child: Navigator(
                          key: _navigationState,
                          onGenerateRoute: (RouteSettings settings) {
                            if (settings.name == LoginRoute.otp) {
                              return MaterialPageRoute(builder: (context) {
                                return LoginForm(
                                  LoginOTPDetails(
                                    loginModel,
                                    divocLocalizations,
                                  ),
                                );
                              });
                            }
                            return MaterialPageRoute(builder: (context) {
                              return LoginForm(
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
      ),
    );
  }
}
