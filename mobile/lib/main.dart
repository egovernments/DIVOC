import 'package:divoc/data_source/network.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/app.dart';
import 'package:flutter/material.dart';
import 'package:key_value_store_flutter/key_value_store_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final apiClient = ApiClient(Dio());
  final flutterKeyValueStore = FlutterKeyValueStore(
    await SharedPreferences.getInstance(),
  );
  runApp(
    ProviderApp(
      authRepository: AuthRepositoryImpl(
        keyValueStore: flutterKeyValueStore,
        apiClient: apiClient,
      ),
      homeRepository: HomeRepositoryImpl(
        keyValueStore: flutterKeyValueStore,
        apiClient: apiClient,
      ),
      apiClient: apiClient,
    ),
  );
}
