import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/model/user.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class UserDetailsForm extends StatelessWidget {
  final FlowTree routeInfo;
  final EnrollUser enrollUser;

  UserDetailsForm(this.routeInfo, this.enrollUser);

  @override
  Widget build(BuildContext context) {
    final localizations = DivocLocalizations.of(context);
    return DivocForm(
      title: localizations.titleVerifyRecipient,
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
              "${localizations.labelGender}: ${enrollUser.gender} | ${localizations.labelDOB}: ${enrollUser.dob}"),
          FieldDetailsWidget(
              localizations.labelProgram, enrollUser.programName),
          SizedBox(
            height: 36,
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              localizations.register(localizations.labelAadhaar),
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(PaddingSize.NORMAL),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.max,
              children: routeInfo.nextRoutes
                  .asMap()
                  .map(
                    (index, program) => MapEntry(
                      index,
                      buildButton(context, program),
                    ),
                  )
                  .values
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildButton(BuildContext context, FlowTree routeMeta) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(PaddingSize.NORMAL),
        child: FormButton(
          text: routeMeta.flowMeta.label,
          onPressed: () {
            final nextRoutePath = routeMeta.routeKey;
            NavigationFormFlow.push(context, nextRoutePath);
          },
        ),
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
          Padding(
            padding: const EdgeInsets.only(bottom: PaddingSize.SMALL),
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
