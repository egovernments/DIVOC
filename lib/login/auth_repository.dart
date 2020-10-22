import 'package:divoc/model/user.dart';

abstract class AuthRepository {
  Future<User> login(String username, String password);

  Future<bool> forgotPassword(String email);

  Future<bool> logout(String email);

  bool get isLoggedIn;
}

class AuthRepositoryImpl implements AuthRepository {
  bool _isLoggedIn = false;

  @override
  Future<bool> forgotPassword(String email) async {
    return Future.delayed(Duration(seconds: 3));
  }

  @override
  Future<User> login(String username, String password) async {
    await Future.delayed(Duration(seconds: 3));
    _isLoggedIn = true;
    return Future.value(User("demo", "demo@demo", "Demo"));
  }

  @override
  Future<bool> logout(String email) {
    // TODO: implement logout
    throw UnimplementedError();
  }

  @override
  bool get isLoggedIn {
    return _isLoggedIn;
  }
}
