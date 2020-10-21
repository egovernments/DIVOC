import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(DivocLocalizations.of(context).title),
      ),
      body: Container(),
    );
  }
}
