// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility that Flutter provides. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:divoc/home/flow_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:divoc/main.dart';

void main() {
  test('Routes', () async {
    //  var appNavigationFlow = flows;
    String route = "/";
    //var possibleRoutes = findPossibleRoutes(route);
    print("\n\nOutput\n-------------");
    //print(possibleRoutes);
  });
}

const json = {
  "select": {
    "verify": {
      "aadhar": {},
      "payment": {},
    },
    "enroll": {
      "userForm": {},
      "payment": {
        "govt": {},
        "voucher": {},
        "direct": {},
      },
    }
  }
};
