import 'package:divoc/base/utils.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/user.dart';
import 'package:flutter/cupertino.dart';

class EnrollmentModel extends ChangeNotifier {
  Resource<EnrollUser> _resourceEnrollUser = Resource.idle();

  Resource<EnrollUser> get enrollUser => _resourceEnrollUser;

  HomeRepository _homeRepository;

  var _enrollmentId = '';

  String get enrollmentId => _enrollmentId;

  EnrollmentModel(this._homeRepository);

  void getEnrollmentDetails(String enrollmentNumber) {
    _resourceEnrollUser = Resource.loading("Loading");
    notifyListeners();
    _enrollmentId = enrollmentNumber;
    _homeRepository.getEnrollmentDetails(enrollmentNumber).then((value) {
      _resourceEnrollUser = Resource.completed(value);
      notifyListeners();
    }).catchError((Object error) {
      _resourceEnrollUser = handleError<EnrollUser>(error);
      notifyListeners();
    });
  }
}
