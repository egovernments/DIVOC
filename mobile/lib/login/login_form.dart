import 'package:divoc/base/constants.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/login/login_model.dart';
import 'package:flutter/material.dart';

class LoginForm extends StatelessWidget {
  final LoginPageDetails _loginPageDetails;

  LoginForm(this._loginPageDetails);

  final GlobalKey<FormState> _formState = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        child: Container(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  DivocLocalizations.of(context).loginTitle,
                  style: Theme.of(context).textTheme.headline6,
                  textAlign: TextAlign.center,
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    bottom: PaddingSize.LARGE,
                  ),
                ),
                Text(
                  DivocLocalizations.of(context).loginSubtitle,
                  style: Theme.of(context).textTheme.caption,
                  textAlign: TextAlign.center,
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: PaddingSize.LARGE),
                ),
                Form(
                  key: _formState,
                  child: TextFormField(
                    autofocus: true,
                    initialValue: _loginPageDetails.inputValue,
                    textAlign: _loginPageDetails.isMobileNumber
                        ? TextAlign.start
                        : TextAlign.center,
                    keyboardType: TextInputType.phone,
                    onSaved: (value) {
                      _loginPageDetails.callApi(value);
                    },
                    validator: (value) {
                      var msg = _loginPageDetails.isValid(value)
                          ? null
                          : _loginPageDetails.errorMessage;
                      return msg;
                    },
                    decoration: buildInputDecoration(
                      _loginPageDetails.isMobileNumber,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: PaddingSize.LARGE),
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

  String get errorMessage;

  bool get isMobileNumber;

  void callApi(String inputValue);

  bool isValid(String input);

  String get inputValue;
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

  @override
  bool isValid(String input) {
    return input.length == 10;
  }

  @override
  String get errorMessage => _divocLocalizations.invalidMobile;

  @override
  String get inputValue => _loginModel.mobileNumber;
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

  @override
  bool isValid(String input) {
    return input.length == 4;
  }

  @override
  String get errorMessage => _divocLocalizations.invalidOTP;

  @override
  String get inputValue => _loginModel.otp;
}
