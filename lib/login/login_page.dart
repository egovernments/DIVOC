import 'dart:async';

import 'package:divoc/base/common_widget.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/login/login_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_portal/flutter_portal.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var authRepository = context.watch<AuthRepository>();
    return ChangeNotifierProvider<LoginModel>(
      create: (_) => LoginModel(authRepository),
      child: Scaffold(
        appBar: AppBar(
          title: Text("Login"),
        ),
        body: Consumer<LoginModel>(
          builder: (context, value, child) {
            if (value.isLoggedIn) {
              scheduleMicrotask(
                  () => {Navigator.pushReplacementNamed(context, '/home')});
            }
            return PortalEntry(
              visible: value.isLoading,
              portal: LoadingOverlay(),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      decoration: InputDecoration(
                          labelText: 'Username', border: OutlineInputBorder()),
                    ),
                    SizedBox(
                      height: 8,
                    ),
                    TextFormField(
                      decoration: InputDecoration(
                          labelText: 'Password', border: OutlineInputBorder()),
                    ),
                    Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: RaisedButton(
                          child: Text("Login"),
                          onPressed: () {
                            value.login("username", "password");
                          },
                        )),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
