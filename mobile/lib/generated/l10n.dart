// GENERATED CODE - DO NOT MODIFY BY HAND
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'intl/messages_all.dart';

// **************************************************************************
// Generator: Flutter Intl IDE plugin
// Made by Localizely
// **************************************************************************

// ignore_for_file: non_constant_identifier_names, lines_longer_than_80_chars
// ignore_for_file: join_return_with_assignment, prefer_final_in_for_each
// ignore_for_file: avoid_redundant_argument_values

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

  /// `You are registering {vaccineName} for:`
  String vaccineLabel(Object vaccineName) {
    return Intl.message(
      'You are registering $vaccineName for:',
      name: 'vaccineLabel',
      desc: '',
      args: [vaccineName],
    );
  }

  /// `Register with {name}`
  String register(Object name) {
    return Intl.message(
      'Register with $name',
      name: 'register',
      desc: '',
      args: [name],
    );
  }

  /// `Payment Mode`
  String get selectPayment {
    return Intl.message(
      'Payment Mode',
      name: 'selectPayment',
      desc: '',
      args: [],
    );
  }

  /// `Invalid Mobile Number`
  String get invalidMobile {
    return Intl.message(
      'Invalid Mobile Number',
      name: 'invalidMobile',
      desc: '',
      args: [],
    );
  }

  /// `Invalid OTP`
  String get invalidOTP {
    return Intl.message(
      'Invalid OTP',
      name: 'invalidOTP',
      desc: '',
      args: [],
    );
  }

  /// `No Internet connection`
  String get msgNoInternet {
    return Intl.message(
      'No Internet connection',
      name: 'msgNoInternet',
      desc: '',
      args: [],
    );
  }

  /// `Please select one program`
  String get programSelectError {
    return Intl.message(
      'Please select one program',
      name: 'programSelectError',
      desc: '',
      args: [],
    );
  }

  /// `Gender`
  String get labelGender {
    return Intl.message(
      'Gender',
      name: 'labelGender',
      desc: '',
      args: [],
    );
  }

  /// `DOB`
  String get labelDOB {
    return Intl.message(
      'DOB',
      name: 'labelDOB',
      desc: '',
      args: [],
    );
  }

  /// `Program Name`
  String get labelProgram {
    return Intl.message(
      'Program Name',
      name: 'labelProgram',
      desc: '',
      args: [],
    );
  }

  /// `Aadhaar`
  String get labelAadhaar {
    return Intl.message(
      'Aadhaar',
      name: 'labelAadhaar',
      desc: '',
      args: [],
    );
  }

  /// `ENTER MANUALLY`
  String get labelEnterManually {
    return Intl.message(
      'ENTER MANUALLY',
      name: 'labelEnterManually',
      desc: '',
      args: [],
    );
  }

  /// `Scan with QR`
  String get labelScanQR {
    return Intl.message(
      'Scan with QR',
      name: 'labelScanQR',
      desc: '',
      args: [],
    );
  }

  /// `Verify Vaccination Recipient`
  String get titleVerifyRecipient {
    return Intl.message(
      'Verify Vaccination Recipient',
      name: 'titleVerifyRecipient',
      desc: '',
      args: [],
    );
  }

  /// `Upcoming, Vaccination Recipients`
  String get titleUpcomingRecipient {
    return Intl.message(
      'Upcoming, Vaccination Recipients',
      name: 'titleUpcomingRecipient',
      desc: '',
      args: [],
    );
  }

  /// `Add details of Vaccination Recipient`
  String get titleDetailsRecipient {
    return Intl.message(
      'Add details of Vaccination Recipient',
      name: 'titleDetailsRecipient',
      desc: '',
      args: [],
    );
  }

  /// `Payment`
  String get titlePayment {
    return Intl.message(
      'Payment',
      name: 'titlePayment',
      desc: '',
      args: [],
    );
  }

  /// `Enter Vaccine Details Manually`
  String get titleEnterVaccineManually {
    return Intl.message(
      'Enter Vaccine Details Manually',
      name: 'titleEnterVaccineManually',
      desc: '',
      args: [],
    );
  }

  /// `Verify Aadhaar`
  String get titleVerifyAadhaar {
    return Intl.message(
      'Verify Aadhaar',
      name: 'titleVerifyAadhaar',
      desc: '',
      args: [],
    );
  }

  /// `Enter Vaccine Details Manually`
  String get titleVerifyVaccineDetailsManually {
    return Intl.message(
      'Enter Vaccine Details Manually',
      name: 'titleVerifyVaccineDetailsManually',
      desc: '',
      args: [],
    );
  }

  /// `SELECT APPROVED VACCINE`
  String get titleSelectApprovedVaccine {
    return Intl.message(
      'SELECT APPROVED VACCINE',
      name: 'titleSelectApprovedVaccine',
      desc: '',
      args: [],
    );
  }

  /// `I confirm the above details are verified before administering the vaccine`
  String get confirmPatientMsg {
    return Intl.message(
      'I confirm the above details are verified before administering the vaccine',
      name: 'confirmPatientMsg',
      desc: '',
      args: [],
    );
  }

  /// `Name`
  String get labelName {
    return Intl.message(
      'Name',
      name: 'labelName',
      desc: '',
      args: [],
    );
  }

  /// `Email`
  String get labelEmail {
    return Intl.message(
      'Email',
      name: 'labelEmail',
      desc: '',
      args: [],
    );
  }

  /// `Mobile`
  String get labelMobile {
    return Intl.message(
      'Mobile',
      name: 'labelMobile',
      desc: '',
      args: [],
    );
  }

  /// `Nationality`
  String get labelNationality {
    return Intl.message(
      'Nationality',
      name: 'labelNationality',
      desc: '',
      args: [],
    );
  }

  /// `DONE`
  String get labelDone {
    return Intl.message(
      'DONE',
      name: 'labelDone',
      desc: '',
      args: [],
    );
  }

  /// `Cannot be Empty`
  String get msgCannotBeEmpty {
    return Intl.message(
      'Cannot be Empty',
      name: 'msgCannotBeEmpty',
      desc: '',
      args: [],
    );
  }

  /// `Change Language`
  String get titleChangeLanguage {
    return Intl.message(
      'Change Language',
      name: 'titleChangeLanguage',
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