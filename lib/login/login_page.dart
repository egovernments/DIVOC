import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  final AuthRepository authRepository = AuthRepositoryImpl();

  @override
  Widget build(BuildContext context) {
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
                        .then((value) => {Navigator.pushNamed(context, '/')}),
                  },
                ))
          ],
        ),
      ),
    );
  }
}
