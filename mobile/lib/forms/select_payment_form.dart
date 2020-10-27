import 'package:divoc/base/common_widget.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

import 'navigation_flow.dart';

class SelectPaymentForm extends StatelessWidget {
  final RouteInfo routeInfo;

  SelectPaymentForm(this.routeInfo);

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
              DivocLocalizations.of(context).selectPayment,
              style: Theme.of(context).textTheme.headline6,
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 16,
          ),
          Column(
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
