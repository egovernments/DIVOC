import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/widgets.dart';

class LoginModel extends ChangeNotifier {
  final AuthRepository _authRepository;

  LoginFlow _currentState = LoginFlow.MOBILE_NUMBER;

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  LoginFlow get currentState => _currentState;

  bool get isLoggedIn => _authRepository.isLoggedIn;

  LoginModel(this._authRepository);

  String _mobileNumber = '';

  void requestOtp(String mobileNumber) {
    _isLoading = true;
    notifyListeners();
    _authRepository.login(mobileNumber, "").then((value) {
      _mobileNumber = mobileNumber;
      _isLoading = false;
      _currentState = LoginFlow.LOGIN;
      notifyListeners();
    });
  }

  void verifyOtp(String otp) {
    _isLoading = true;
    notifyListeners();
    _authRepository.login(_mobileNumber, otp).then((value) {
      _isLoading = false;
      _currentState = LoginFlow.SUCCESS;
      notifyListeners();
    });
  }
}

enum LoginFlow { MOBILE_NUMBER, LOGIN, SUCCESS }

class LoginRoute {
  static const String mobileNumber = '/';
  static const String otp = '/otp';
}
