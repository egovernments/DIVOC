import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/model/user.dart';
import 'package:flutter/material.dart';

class UserDetailsForm extends StatelessWidget {
  final RouteInfo routeInfo;
  final EnrollUser enrollUser;

  UserDetailsForm(this.routeInfo, this.enrollUser);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titleVerifyRecipient,
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(PaddingSize.LARGE),
            child: Text(
              DivocLocalizations.of(context)
                  .vaccineLabel(enrollUser.programName),
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 16,
          ),
          FieldDetailsWidget(enrollUser.name,
              "Gender: ${enrollUser.gender} | DOB: ${enrollUser.dob}"),
          FieldDetailsWidget("Program Name", enrollUser.programName),
          SizedBox(
            height: 36,
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              DivocLocalizations.of(context).register("Aadhaar"),
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.max,
            children: routeInfo.nextRoutesMeta
                .map((item) => Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: RaisedButton(
                        child: Text(item.nextRouteName),
                        onPressed: () {
                          final nextRoutePath = item.fullNextRoutePath;
                          NavigationFormFlow.push(context, nextRoutePath);
                        },
                      ),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class FieldDetailsWidget extends StatelessWidget {
  final String title;
  final String subtitle;

  FieldDetailsWidget(this.title, this.subtitle);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.headline6,
            textAlign: TextAlign.center,
          ),
          SizedBox(
            height: 4,
          ),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.caption,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
