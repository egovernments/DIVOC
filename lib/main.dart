import 'package:divoc/data_source/network.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/app.dart';
import 'package:flutter/material.dart';
import 'package:key_value_store_flutter/key_value_store_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    ProviderApp(
      repository: AuthRepositoryImpl(
        keyValueStore: FlutterKeyValueStore(
          await SharedPreferences.getInstance(),
        ),
        apiClient: ApiClient(Dio()),
      ),
    ),
  );
}
