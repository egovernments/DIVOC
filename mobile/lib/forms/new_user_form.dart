import 'package:divoc/base/common_widget.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

import 'navigation_flow.dart';

class NewUserEnrollForm extends StatelessWidget {
  final RouteInfo routeInfo;

  NewUserEnrollForm(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titleDetailsRecipient,
      child: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                keyboardType: TextInputType.name,
                onSaved: (value) {},
                validator: (value) {
                  var msg = value.isEmpty ? "Cannot be Empty" : null;
                  return msg;
                },
                decoration: InputDecoration(
                  labelText: "Name :",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                keyboardType: TextInputType.emailAddress,
                onSaved: (value) {},
                validator: (value) {
                  var msg = value.isEmpty ? "Cannot be Empty" : null;
                  return msg;
                },
                decoration: InputDecoration(
                  labelText: "Email :",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextFormField(
                keyboardType: TextInputType.phone,
                onSaved: (value) {},
                validator: (value) {
                  var msg = value.isEmpty ? "Cannot be Empty" : null;
                  return msg;
                },
                decoration: InputDecoration(
                  labelText: "Mobile :",
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: RaisedButton(
                child: Text("DONE"),
                onPressed: () {
                  NavigationFormFlow.push(
                      context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
