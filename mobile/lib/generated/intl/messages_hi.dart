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

  static m1(vaccineName) => "आप ${vaccineName} लिए का पंजीकरण कर रहे हैं:";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static _notInlinedMessages(_) => <String, Function> {
    "confirmPatientMsg" : MessageLookupByLibrary.simpleMessage("मैं पुष्टि करता हूं कि उपरोक्त विवरण वैक्सीन को प्रशासित करने से पहले सत्यापित किए गए हैं"),
    "invalidMobile" : MessageLookupByLibrary.simpleMessage("Invalid Mobile Number"),
    "invalidOTP" : MessageLookupByLibrary.simpleMessage("Invalid OTP"),
    "labelAadhaar" : MessageLookupByLibrary.simpleMessage("आधार"),
    "labelDOB" : MessageLookupByLibrary.simpleMessage("DOB"),
    "labelDone" : MessageLookupByLibrary.simpleMessage("आगे"),
    "labelEmail" : MessageLookupByLibrary.simpleMessage("ईमेल"),
    "labelEnterManually" : MessageLookupByLibrary.simpleMessage("ENTER MANUALLY"),
    "labelGender" : MessageLookupByLibrary.simpleMessage("Gender"),
    "labelLogin" : MessageLookupByLibrary.simpleMessage("लॉग इन"),
    "labelMobile" : MessageLookupByLibrary.simpleMessage("मोबाइल"),
    "labelName" : MessageLookupByLibrary.simpleMessage("नाम"),
    "labelNationality" : MessageLookupByLibrary.simpleMessage("राष्ट्रीयता"),
    "labelNext" : MessageLookupByLibrary.simpleMessage("आगे"),
    "labelOTP" : MessageLookupByLibrary.simpleMessage("ओटीपी प्राप्त करें"),
    "labelProgram" : MessageLookupByLibrary.simpleMessage("Program Name"),
    "labelScanQR" : MessageLookupByLibrary.simpleMessage("Scan with QR"),
    "loginSubtitle" : MessageLookupByLibrary.simpleMessage("कृपया अपने DIVOC खाते में प्रवेश करें"),
    "loginTitle" : MessageLookupByLibrary.simpleMessage("DIVOC वैक्सीन प्रशासन पोर्टल \nमें आपका स्वागत है"),
    "msgCannotBeEmpty" : MessageLookupByLibrary.simpleMessage("खाली की अनुमति नहीं है"),
    "msgNoInternet" : MessageLookupByLibrary.simpleMessage("कोई इंटरनेट कनेक्शन नहीं हैं"),
    "programSelectError" : MessageLookupByLibrary.simpleMessage("कृपया एक प्रोग्राम चुनें"),
    "register" : m0,
    "selectPayment" : MessageLookupByLibrary.simpleMessage("भुगतान का प्रकार"),
    "selectProgram" : MessageLookupByLibrary.simpleMessage("कृपया वैक्सीन प्रोग्राम चुनें"),
    "tAndC" : MessageLookupByLibrary.simpleMessage("TERMS OF USE. PRIVACY POLICY"),
    "title" : MessageLookupByLibrary.simpleMessage("DIVOC"),
    "titleDetailsRecipient" : MessageLookupByLibrary.simpleMessage("टीकाकरण प्राप्तकर्ता का विवरण जोड़ें"),
    "titleEnterVaccineManually" : MessageLookupByLibrary.simpleMessage("वैक्सीन विवरण मैन्युअल रूप से दर्ज करें"),
    "titlePayment" : MessageLookupByLibrary.simpleMessage("भुगतान"),
    "titleSelectApprovedVaccine" : MessageLookupByLibrary.simpleMessage("SELECT APPROVED VACCINE"),
    "titleUpcomingRecipient" : MessageLookupByLibrary.simpleMessage("Upcoming, Vaccination Recipients"),
    "titleVerifyAadhaar" : MessageLookupByLibrary.simpleMessage("Verify Aadhaar"),
    "titleVerifyRecipient" : MessageLookupByLibrary.simpleMessage("Verify Vaccination Recipient"),
    "titleVerifyVaccineDetailsManually" : MessageLookupByLibrary.simpleMessage("वैक्सीन विवरण मैन्युअल रूप से दर्ज करें \""),
    "vaccineLabel" : m1
  };
}
