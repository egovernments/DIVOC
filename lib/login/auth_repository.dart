import 'package:divoc/model/user.dart';

abstract class AuthRepository {
  Future<User> login(String username, String password);

  Future<bool> forgotPassword(String email);
}

class AuthRepositoryImpl implements AuthRepository {
  @override
  Future<bool> forgotPassword(String email) async {
    return Future.delayed(Duration(seconds: 3));
  }

  @override
  Future<User> login(String username, String password) async {
    await Future.delayed(Duration(seconds: 3));
    return Future.value(User("demo", "demo@demo", "Demo"));
  }
}
