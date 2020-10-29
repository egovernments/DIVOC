import 'package:divoc/base/utils.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:flutter/widgets.dart';
import 'package:json_annotation/json_annotation.dart';

class HomeModel extends ChangeNotifier {
  Resource<List<VaccineProgram>> _resource;

  Resource<List<VaccineProgram>> get state => _resource;

  HomeRepository _homeRepository;

  HomeModel(HomeRepository homeRepository) {
    _homeRepository = homeRepository;
    getVaccinePrograms();
  }

  void getVaccinePrograms() {
    _resource = Resource.loading("Loading");
    notifyListeners();

    _homeRepository.loadVaccines().then((value) {
      _resource = Resource.completed(value);
      notifyListeners();
    }).catchError((Object error) {
      _resource = handleError<List<VaccineProgram>>(error);
      notifyListeners();
    });
  }

  VaccineProgram selectedVaccine;

  void vaccineSelected(VaccineProgram value) {
    selectedVaccine = value;
    notifyListeners();
  }
}
