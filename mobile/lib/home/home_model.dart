import 'package:divoc/base/utils.dart';
import 'package:flutter/widgets.dart';

class HomeModel extends ChangeNotifier {
  Resource<List<VaccineProgram>> _resource;

  Resource<List<VaccineProgram>> get state => _resource;

  HomeModel() {
    getVaccinePrograms();
  }

  void getVaccinePrograms() {
    _resource = Resource.loading("Loading");
    notifyListeners();
    Future.delayed(Duration(seconds: 2), () {
      _resource = Resource.completed(programs);
      notifyListeners();
    });
  }

  String selectedVaccine;

  void vaccineSelected(value) {
    selectedVaccine = value;
    notifyListeners();
  }
}

final programs = [
  VaccineProgram("covid19", "Covid-19 Vaccine (C19)"),
  VaccineProgram("measles", "Measles Rubella (MR) vaccine"),
  VaccineProgram("pneumococcal", "Pneumococcal Conjugate Vaccine (PCV)"),
  VaccineProgram("rotavirus", "Rotavirus vaccine (RVV)"),
];

class VaccineProgram {
  final String id;
  final String name;

  VaccineProgram(this.id, this.name);
}
