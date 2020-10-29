import 'dart:convert';

import 'package:divoc/base/share_preferences.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/model/user.dart';
import 'package:meta/meta.dart';
import 'package:key_value_store/key_value_store.dart';

abstract class AuthRepository {
  Future<User> login(String username, String password);

  Future<bool> forgotPassword(String email);

  Future<bool> requestOtp(String mobileNumber);

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
    try {
      var response = await apiClient.login(username, password);
      keyValueStore.setString(USER_DETAILS, jsonEncode(response));
      return Future.value(response);
    } on Exception catch (e) {
      throw handleNetworkError(e);
    }
  }

  @override
  Future<bool> logout(String email) {
    // TODO: implement logout
    throw UnimplementedError();
  }

  @override
  bool get isLoggedIn {
    final userDetails = keyValueStore.getString(USER_DETAILS);
    if (userDetails == null) {
      return false;
    }
    return true;
  }

  @override
  Future<bool> requestOtp(String mobileNumber) async {
    try {
      var response = await apiClient.requestOtp(mobileNumber);
      print(response);
      return Future.value(true);
    } on Exception catch (e) {
      throw handleNetworkError(e);
    }
  }
}
