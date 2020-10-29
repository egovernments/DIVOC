import 'package:divoc/base/utils.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/widgets.dart';

class LoginModel extends ChangeNotifier {
  final AuthRepository _authRepository;

  LoginFlow _flowState = LoginFlow.MOBILE_NUMBER;

  Resource<bool> _currentState = Resource.idle();

  Resource<bool> get currentState => _currentState;

  LoginFlow get flowState => _flowState;

  bool get isLoggedIn => _authRepository.isLoggedIn;

  LoginModel(this._authRepository);

  String _mobileNumber = '';
  String _otp = '';

  String get mobileNumber => _mobileNumber;

  String get otp => _otp;

  void requestOtp(String mobileNumber) {
    _currentState = Resource.loading("Loading...");
    _mobileNumber = mobileNumber;
    notifyListeners();
    _authRepository.requestOtp(mobileNumber).then((value) {
      _currentState = Resource.completed(true);
      _flowState = LoginFlow.LOGIN;
      notifyListeners();
    }).catchError((Object error) {
      _currentState = handleError<bool>(error);
      notifyListeners();
    });
  }

  void verifyOtp(String otp) {
    _currentState = Resource.loading("Loading...");
    _otp = otp;
    notifyListeners();
    _authRepository.login(_mobileNumber, otp).then((value) {
      _currentState = Resource.completed(true);
      _flowState = LoginFlow.SUCCESS;
      notifyListeners();
    }).catchError((Object error) {
      _currentState = handleError<bool>(error);
      notifyListeners();
    });
  }
}

enum LoginFlow { MOBILE_NUMBER, LOGIN, SUCCESS }

class LoginRoute {
  static const String mobileNumber = '/';
  static const String otp = '/otp';
}
