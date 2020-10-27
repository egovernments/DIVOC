import 'package:divoc/base/common_widget.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class UserDetailsScreen extends StatelessWidget {
  final RouteInfo routeInfo;
  final String programName = "Covid-19 Vaccine (C19)";

  UserDetailsScreen(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              DivocLocalizations.of(context).vaccineLabel(programName),
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 16,
          ),
          FieldDetailsWidget("Vivek Singh", "Gender: Male | DOB: 28/10/1990"),
          FieldDetailsWidget("Program Name", programName),
          SizedBox(
            height: 36,
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              DivocLocalizations.of(context).register("Aadhar"),
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
