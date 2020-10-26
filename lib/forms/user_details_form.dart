import 'package:divoc/base/common_widget.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class UserDetailsScreen extends StatelessWidget {
  final RouteInfo routeInfo;

  UserDetailsScreen(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Column(
        children: [
          Text(
            DivocLocalizations.of(context)
                .vaccineLabel("Covid-19 Vaccine (C19)"),
            style: Theme.of(context).textTheme.headline6,
            textAlign: TextAlign.center,
          ),
          ListView.builder(
            shrinkWrap: true,
            itemCount: routeInfo.nextRoutesMeta.length,
            itemBuilder: (BuildContext context, int index) {
              return RaisedButton(
                child: Text(routeInfo.nextRoutesMeta[index].nextRouteName),
                onPressed: () {
                  final nextRoutePath =
                      routeInfo.nextRoutesMeta[index].fullNextRoutePath;
                  NavigationFormFlow.push(context, nextRoutePath);
                },
              );
            },
          )
        ],
      ),
    );
  }
}
