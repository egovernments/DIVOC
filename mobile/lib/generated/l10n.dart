// GENERATED CODE - DO NOT MODIFY BY HAND
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'intl/messages_all.dart';

// **************************************************************************
// Generator: Flutter Intl IDE plugin
// Made by Localizely
// **************************************************************************

// ignore_for_file: non_constant_identifier_names, lines_longer_than_80_chars

class DivocLocalizations {
  DivocLocalizations();
  
  static DivocLocalizations current;
  
  static const AppLocalizationDelegate delegate =
    AppLocalizationDelegate();

  static Future<DivocLocalizations> load(Locale locale) {
    final name = (locale.countryCode?.isEmpty ?? false) ? locale.languageCode : locale.toString();
    final localeName = Intl.canonicalizedLocale(name); 
    return initializeMessages(localeName).then((_) {
      Intl.defaultLocale = localeName;
      DivocLocalizations.current = DivocLocalizations();
      
      return DivocLocalizations.current;
    });
  } 

  static DivocLocalizations of(BuildContext context) {
    return Localizations.of<DivocLocalizations>(context, DivocLocalizations);
  }

  /// `DIVOC`
  String get title {
    return Intl.message(
      'DIVOC',
      name: 'title',
      desc: '',
      args: [],
    );
  }

  /// `Welcome to the DIVOC\nVaccine Administration Portal`
  String get loginTitle {
    return Intl.message(
      'Welcome to the DIVOC\nVaccine Administration Portal',
      name: 'loginTitle',
      desc: '',
      args: [],
    );
  }

  /// `Please login to your DIVOC Account`
  String get loginSubtitle {
    return Intl.message(
      'Please login to your DIVOC Account',
      name: 'loginSubtitle',
      desc: '',
      args: [],
    );
  }

  /// `GET OTP`
  String get labelOTP {
    return Intl.message(
      'GET OTP',
      name: 'labelOTP',
      desc: '',
      args: [],
    );
  }

  /// `LOGIN`
  String get labelLogin {
    return Intl.message(
      'LOGIN',
      name: 'labelLogin',
      desc: '',
      args: [],
    );
  }

  /// `TERMS OF USE. PRIVACY POLICY`
  String get tAndC {
    return Intl.message(
      'TERMS OF USE. PRIVACY POLICY',
      name: 'tAndC',
      desc: '',
      args: [],
    );
  }

  /// `Please select Vaccine Program`
  String get selectProgram {
    return Intl.message(
      'Please select Vaccine Program',
      name: 'selectProgram',
      desc: '',
      args: [],
    );
  }

  /// `Next`
  String get labelNext {
    return Intl.message(
      'Next',
      name: 'labelNext',
      desc: '',
      args: [],
    );
  }
}

class AppLocalizationDelegate extends LocalizationsDelegate<DivocLocalizations> {
  const AppLocalizationDelegate();

  List<Locale> get supportedLocales {
    return const <Locale>[
      Locale.fromSubtags(languageCode: 'en'),
      Locale.fromSubtags(languageCode: 'hi'),
    ];
  }

  @override
  bool isSupported(Locale locale) => _isSupported(locale);
  @override
  Future<DivocLocalizations> load(Locale locale) => DivocLocalizations.load(locale);
  @override
  bool shouldReload(AppLocalizationDelegate old) => false;

  bool _isSupported(Locale locale) {
    if (locale != null) {
      for (var supportedLocale in supportedLocales) {
        if (supportedLocale.languageCode == locale.languageCode) {
          return true;
        }
      }
    }
    return false;
  }
}