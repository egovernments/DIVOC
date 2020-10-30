import 'package:divoc/base/utils.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:flutter/widgets.dart';

class HomeModel extends ChangeNotifier {
  Resource<List<VaccineProgram>> _resourceVaccine;

  Resource<List<VaccineProgram>> get resourceVaccine => _resourceVaccine;

  HomeRepository _homeRepository;

  HomeModel(HomeRepository homeRepository) {
    _homeRepository = homeRepository;
    getVaccinePrograms();
  }

  void getVaccinePrograms() {
    _resourceVaccine = Resource.loading("Loading");
    notifyListeners();

    _homeRepository.loadVaccines().then((value) {
      _resourceVaccine = Resource.completed(value);
      notifyListeners();
    }).catchError((Object error) {
      _resourceVaccine = handleError<List<VaccineProgram>>(error);
      notifyListeners();
    });
  }
}
