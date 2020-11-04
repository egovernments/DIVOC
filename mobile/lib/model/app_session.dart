import 'dart:collection';

import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/cupertino.dart';

final UnmodifiableListView<LanguageSupport> languageSupport =
    new UnmodifiableListView([
  LanguageSupport("English", "en"),
  LanguageSupport("हिंदी", "hi"),
]);

class AppSession extends ChangeNotifier {
  final AuthRepository authRepository;

  AppSession(this.authRepository);

  LanguageSupport _selectedLanguage = languageSupport[0];

  LanguageSupport get selectedLanguage => _selectedLanguage;

  void logout() {
    authRepository.logout().then((value) => notifyListeners());
  }

  void changeLanguage(LanguageSupport languageSupport) {
    _selectedLanguage = languageSupport;
    notifyListeners();
  }
}

class LanguageSupport {
  final String name;
  final String code;

  LanguageSupport(this.name, this.code);
}
