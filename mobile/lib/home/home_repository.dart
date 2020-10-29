import 'package:divoc/base/utils.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/forms/vaccination_program_page.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:flutter/foundation.dart';
import 'package:key_value_store/key_value_store.dart';

abstract class HomeRepository {
  Future<List<VaccineProgram>> loadVaccines();
}

class HomeRepositoryImpl extends HomeRepository {
  final KeyValueStore keyValueStore;
  final ApiClient apiClient;

  HomeRepositoryImpl({@required this.keyValueStore, @required this.apiClient});

  @override
  Future<List<VaccineProgram>> loadVaccines() async {
    try {
      var response = await apiClient.vaccinePrograms();
      return Future.value(response);
    } on Exception catch (e) {
      throw handleNetworkError(e);
    }
  }
}
