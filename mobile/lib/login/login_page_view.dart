import 'package:divoc/generated/l10n.dart';
import 'package:divoc/login/login_model.dart';
import 'package:flutter/material.dart';

class LoginFormPage extends StatelessWidget {
  final LoginPageDetails _loginPageDetails;

  LoginFormPage(this._loginPageDetails);

  final GlobalKey<FormState> _formState = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                DivocLocalizations.of(context).loginTitle,
                style: Theme.of(context).textTheme.headline6,
                textAlign: TextAlign.center,
              ),
              SizedBox(
                height: 24,
              ),
              Text(
                DivocLocalizations.of(context).loginSubtitle,
                style: Theme.of(context).textTheme.caption,
                textAlign: TextAlign.center,
              ),
              SizedBox(
                height: 24,
              ),
              Form(
                key: _formState,
                child: TextFormField(
                  textAlign: TextAlign.center,
                  keyboardType: TextInputType.phone,
                  onSaved: (value) {
                    _loginPageDetails.callApi(value);
                  },
                  validator: (value) {
                    var msg = value.isEmpty ? "Cannot be Empty" : null;
                    return msg;
                  },
                  decoration: buildInputDecoration(
                    _loginPageDetails.isMobileNumber,
                  ),
                ),
              ),
              SizedBox(
                height: 24,
              ),
              RaisedButton(
                child: Text(_loginPageDetails.labelText),
                onPressed: () {
                  if (_formState.currentState.validate()) {
                    _formState.currentState.save();
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration buildInputDecoration(bool isMobileNumber) {
    if (isMobileNumber) {
      return InputDecoration(
        prefixIcon: Icon(Icons.phone_android),
        prefixText: "+91   ",
        border: OutlineInputBorder(),
      );
    }
    return InputDecoration(
      border: OutlineInputBorder(),
    );
  }
}

abstract class LoginPageDetails {
  String get labelText;

  bool get isMobileNumber;

  void callApi(String inputValue);
}

class LoginMobileDetails extends LoginPageDetails {
  final LoginModel _loginModel;
  final DivocLocalizations _divocLocalizations;

  LoginMobileDetails(this._loginModel, this._divocLocalizations);

  @override
  void callApi(String inputValue) {
    _loginModel.requestOtp(inputValue);
  }

  @override
  String get labelText => _divocLocalizations.labelOTP;

  @override
  bool get isMobileNumber => true;
}

class LoginOTPDetails extends LoginPageDetails {
  final LoginModel _loginModel;
  final DivocLocalizations _divocLocalizations;

  LoginOTPDetails(this._loginModel, this._divocLocalizations);

  @override
  void callApi(String inputValue) {
    _loginModel.verifyOtp(inputValue);
  }

  @override
  String get labelText => _divocLocalizations.labelLogin;

  @override
  bool get isMobileNumber => false;
}
