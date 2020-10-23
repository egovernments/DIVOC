import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/widgets.dart';

class LoginModel extends ChangeNotifier {
  final AuthRepository _authRepository;

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  bool get isLoggedIn => _authRepository.isLoggedIn;

  LoginModel(this._authRepository);

  void login(String username, String password) {
    _isLoading = true;
    notifyListeners();
    _authRepository.login(username, password).then((value) {
      _isLoading = false;
      notifyListeners();
    });
  }
}
