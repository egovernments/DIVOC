import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/forms/user_details_form.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class CertifyDetailsForm extends StatelessWidget {
  final RouteInfo routeInfo;
  final ValueNotifier<bool> valueNotifierConfirmed = ValueNotifier(false);

  CertifyDetailsForm(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    var localizations = DivocLocalizations.of(context);
    return DivocForm(
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            ImageAssetPath.VACCINE_ACTIVE,
            width: 50,
          ),
          Padding(
            padding: const EdgeInsets.all(PaddingSize.LARGE),
            child: Text(
              "Administering the C-19 Vaccination to",
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 16,
          ),
          FieldDetailsWidget(
            "Vivek Singh",
            "${localizations.labelGender}: Male | ${localizations.labelDOB}: 42",
          ),
          SizedBox(
            height: 36,
          ),
          ValueListenableBuilder(
            valueListenable: valueNotifierConfirmed,
            builder: (context, value, child) {
              return CheckboxListTile(
                title: Text(localizations.confirmPatientMsg),
                value: valueNotifierConfirmed.value,
                controlAffinity: ListTileControlAffinity.leading,
                onChanged: (value) {
                  valueNotifierConfirmed.value = value;
                },
              );
            },
          ),
          SizedBox(
            height: 36,
          ),
          FormButton(
            text: "Certify",
            onPressed: () {
              Navigator.of(context).pushNamedAndRemoveUntil(
                  "/upcomingRecipients",
                  (route) => route.settings.name == "/upcomingRecipients");
            },
          )
        ],
      ),
    );
  }
}
