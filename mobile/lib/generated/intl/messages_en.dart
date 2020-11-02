// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a en locale. All the
// messages from the main program should be duplicated here with the same
// function name.

// Ignore issues from commonly used lints in this file.
// ignore_for_file:unnecessary_brace_in_string_interps, unnecessary_new
// ignore_for_file:prefer_single_quotes,comment_references, directives_ordering
// ignore_for_file:annotate_overrides,prefer_generic_function_type_aliases
// ignore_for_file:unused_import, file_names

import 'package:intl/intl.dart';
import 'package:intl/message_lookup_by_library.dart';

final messages = new MessageLookup();

typedef String MessageIfAbsent(String messageStr, List<dynamic> args);

class MessageLookup extends MessageLookupByLibrary {
  String get localeName => 'en';

  static m0(name) => "Register with ${name}";

  static m1(vaccineName) => "You are registering ${vaccineName} for:";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static _notInlinedMessages(_) => <String, Function> {
    "confirmPatientMsg" : MessageLookupByLibrary.simpleMessage("I confirm the above details are verified before administering the vaccine"),
    "invalidMobile" : MessageLookupByLibrary.simpleMessage("Invalid Mobile Number"),
    "invalidOTP" : MessageLookupByLibrary.simpleMessage("Invalid OTP"),
    "labelAadhaar" : MessageLookupByLibrary.simpleMessage("Aadhaar"),
    "labelDOB" : MessageLookupByLibrary.simpleMessage("DOB"),
    "labelEnterManually" : MessageLookupByLibrary.simpleMessage("ENTER MANUALLY"),
    "labelGender" : MessageLookupByLibrary.simpleMessage("Gender"),
    "labelLogin" : MessageLookupByLibrary.simpleMessage("LOGIN"),
    "labelNext" : MessageLookupByLibrary.simpleMessage("Next"),
    "labelOTP" : MessageLookupByLibrary.simpleMessage("GET OTP"),
    "labelProgram" : MessageLookupByLibrary.simpleMessage("Program Name"),
    "labelScanQR" : MessageLookupByLibrary.simpleMessage("Scan with QR"),
    "loginSubtitle" : MessageLookupByLibrary.simpleMessage("Please login to your DIVOC Account"),
    "loginTitle" : MessageLookupByLibrary.simpleMessage("Welcome to the DIVOC\nVaccine Administration Portal"),
    "msgNoInternet" : MessageLookupByLibrary.simpleMessage("No Internet connection"),
    "programSelectError" : MessageLookupByLibrary.simpleMessage("Please select one program"),
    "register" : m0,
    "selectPayment" : MessageLookupByLibrary.simpleMessage("Please select payment mode"),
    "selectProgram" : MessageLookupByLibrary.simpleMessage("Please select Vaccine Program"),
    "tAndC" : MessageLookupByLibrary.simpleMessage("TERMS OF USE. PRIVACY POLICY"),
    "title" : MessageLookupByLibrary.simpleMessage("DIVOC"),
    "titleDetailsRecipient" : MessageLookupByLibrary.simpleMessage("Add details of Vaccination Recipient"),
    "titleEnterVaccineManually" : MessageLookupByLibrary.simpleMessage("Enter Vaccine Details Manually"),
    "titlePayment" : MessageLookupByLibrary.simpleMessage("Payment"),
    "titleSelectApprovedVaccine" : MessageLookupByLibrary.simpleMessage("SELECT APPROVED VACCINE"),
    "titleUpcomingRecipient" : MessageLookupByLibrary.simpleMessage("Upcoming, Vaccination Recipients"),
    "titleVerifyAadhaar" : MessageLookupByLibrary.simpleMessage("Verify Aadhaar"),
    "titleVerifyRecipient" : MessageLookupByLibrary.simpleMessage("Verify Vaccination Recipient"),
    "titleVerifyVaccineDetailsManually" : MessageLookupByLibrary.simpleMessage("Enter Vaccine Details Manually"),
    "vaccineLabel" : m1
  };
}
