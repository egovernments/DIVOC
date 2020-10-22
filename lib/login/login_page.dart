import 'dart:async';

import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authRepository = context.watch<AuthRepository>();
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
      ),
      body: Padding(
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
                  onPressed: () => {
                    authRepository
                        .login("username", "password")
                        .then((value) => {
                              scheduleMicrotask(() => {
                                    Navigator.pushReplacementNamed(
                                        context, '/home')
                                  })
                            }),
                  },
                ))
          ],
        ),
      ),
    );
  }
}
