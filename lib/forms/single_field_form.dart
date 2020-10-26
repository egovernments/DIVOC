import 'package:divoc/base/common_widget.dart';
import 'package:flutter/material.dart';

typedef OnNext = Function(BuildContext context, String value);

class SingleFieldForm extends StatelessWidget {
  final String title;
  final String btnText;
  final OnNext onNext;

  final GlobalKey<FormState> _formState = GlobalKey<FormState>();

  SingleFieldForm({this.title, this.btnText, this.onNext});

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.max,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.headline6,
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formState,
              child: TextFormField(
                textAlign: TextAlign.center,
                keyboardType: TextInputType.phone,
                onSaved: (value) {
                  onNext(context, value);
                },
                validator: (value) {
                  var msg = value.isEmpty ? "Cannot be Empty" : null;
                  return msg;
                },
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                ),
              ),
            ),
          ),
          RaisedButton(
            child: Text(btnText),
            onPressed: () {
              if (_formState.currentState.validate()) {
                _formState.currentState.save();
              }
            },
          )
        ],
      ),
    );
  }
}
