import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/cupertino.dart';

class AppSession extends ChangeNotifier {
  final AuthRepository authRepository;

  AppSession(this.authRepository);

  void logout() {
    authRepository.logout().then((value) => notifyListeners());
  }
}

enum AppState { HOME, LOGIN }
