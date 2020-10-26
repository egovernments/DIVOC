import 'package:divoc/base/share_preferences.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/model/user.dart';
import 'package:meta/meta.dart';
import 'package:key_value_store/key_value_store.dart';

abstract class AuthRepository {
  Future<User> login(String username, String password);

  Future<bool> forgotPassword(String email);

  Future<bool> logout(String email);

  bool get isLoggedIn;
}

class AuthRepositoryImpl implements AuthRepository {
  final KeyValueStore keyValueStore;
  final ApiClient apiClient;

  AuthRepositoryImpl({@required this.keyValueStore, @required this.apiClient});

  @override
  Future<bool> forgotPassword(String email) async {
    return Future.delayed(Duration(seconds: 3));
  }

  @override
  Future<User> login(String username, String password) async {
    print(username + " " + password);
    try {
      var response = await apiClient.login(username, password);
      print(response);
      keyValueStore.setBool(IS_LOGGED_IN, true);
      return Future.value(User("demo", "demo@demo", "Demo"));
    } catch (e) {
      return Future.error(e);
    }
  }

  @override
  Future<bool> logout(String email) {
    // TODO: implement logout
    throw UnimplementedError();
  }

  @override
  bool get isLoggedIn {
    final isLoggedIn = keyValueStore.getBool(IS_LOGGED_IN);
    if (isLoggedIn == null) {
      return false;
    }
    return isLoggedIn;
  }
}
