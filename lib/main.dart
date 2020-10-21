import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/app.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return ProviderApp(
      repository: AuthRepositoryImpl(),
    );
  }
}
