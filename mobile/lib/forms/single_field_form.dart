import 'dart:async';

import 'package:divoc/base/common_extension.dart';
import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/forms/enrollment_model.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';
import 'package:flutter_portal/flutter_portal.dart';
import 'package:provider/provider.dart';

typedef OnNext = Function(BuildContext context, String value);

class SingleFieldForm extends StatelessWidget {
  final String title;
  final String btnText;
  final String defaultValue;

  final OnNext onNext;

  final GlobalKey<FormState> _formState = GlobalKey<FormState>();

  SingleFieldForm(
      {this.title, this.btnText, this.onNext, this.defaultValue = ''});

  @override
  Widget build(BuildContext context) {
    return Column(
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
              initialValue: defaultValue,
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
        FormButton(
          text: btnText,
          onPressed: () {
            if (_formState.currentState.validate()) {
              FocusScope.of(context).unfocus();
              _formState.currentState.save();
            }
          },
        )
      ],
    );
  }
}

class PreEnrollmentForm extends StatelessWidget {
  final FlowTree routeInfo;

  PreEnrollmentForm(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    var homeRepository = context.watch<HomeRepository>();
    return ChangeNotifierProvider(
      create: (_) => EnrollmentModel(homeRepository),
      child: Consumer<EnrollmentModel>(
        builder: (context, enrollModel, child) {
          var status = enrollModel.enrollUser.status;
          scheduleMicrotask(() {
            switch (status) {
              case Status.COMPLETED:
                Navigator.of(context).pushNamed(
                    routeInfo.nextRoutes[0].routeKey,
                    arguments: enrollModel.enrollUser.data);
                break;
              case Status.ERROR:
                context.showSnackbarMessage(enrollModel.enrollUser.message);
                break;
            }
          });

          return PortalEntry(
            visible: status == Status.LOADING,
            portal: LoadingOverlay(),
            child: DivocForm(
              title: DivocLocalizations.of(context).titleVerifyRecipient,
              child: SingleFieldForm(
                title: "Enter Pre Enrolment Code",
                btnText: "Next",
                defaultValue: enrollModel.enrollmentId,
                onNext: (context, value) {
                  enrollModel.getEnrollmentDetails(value);
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
