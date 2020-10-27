// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a hi locale. All the
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
  String get localeName => 'hi';

  static m0(name) => "Register with ${name}";

  static m1(vaccineName) => "You are registering ${vaccineName} for:";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static _notInlinedMessages(_) => <String, Function> {
    "labelLogin" : MessageLookupByLibrary.simpleMessage("LOGIN"),
    "labelNext" : MessageLookupByLibrary.simpleMessage("Next"),
    "labelOTP" : MessageLookupByLibrary.simpleMessage("GET OTP"),
    "loginSubtitle" : MessageLookupByLibrary.simpleMessage("Please login to your DIVOC Account"),
    "loginTitle" : MessageLookupByLibrary.simpleMessage("Welcome to the DIVOC\nVaccine Administration Portal"),
    "register" : m0,
    "selectPayment" : MessageLookupByLibrary.simpleMessage("Select Payment"),
    "selectProgram" : MessageLookupByLibrary.simpleMessage("Please select Vaccine Program"),
    "tAndC" : MessageLookupByLibrary.simpleMessage("TERMS OF USE. PRIVACY POLICY"),
    "title" : MessageLookupByLibrary.simpleMessage("DIVOC"),
    "vaccineLabel" : m1
  };
}
