import 'package:flutter/material.dart';

extension ShowSnackbar on BuildContext {
  void showSnackbarMessage(String message) {
    Scaffold.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
      ),
    );
  }
}
