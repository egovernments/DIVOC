import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

import 'navigation_flow.dart';

class SelectPaymentForm extends StatelessWidget {
  final RouteInfo routeInfo;
  final buttonNames = ["Government", "Voucher", "Direct"];

  SelectPaymentForm(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titlePayment,
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(PaddingSize.SMALL),
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
                .asMap()
                .map(
                  (index, item) => MapEntry(
                    index,
                    buildPaymentButtons(context, item, index),
                  ),
                )
                .values
                .toList(),
          ),
        ],
      ),
    );
  }

  Padding buildPaymentButtons(BuildContext context, RouteMeta item, int index) {
    return Padding(
      padding: const EdgeInsets.only(
        left: PaddingSize.LARGE,
        right: PaddingSize.LARGE,
        top: PaddingSize.SMALL,
        bottom: PaddingSize.SMALL,
      ),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Theme.of(context).textTheme.caption.color,
          ),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: ListTile(
          enabled: index != 0,
          title: Text(buttonNames[index]),
          trailing: Icon(Icons.navigate_next),
          onTap: () {
            final nextRoutePath = item.fullNextRoutePath;
            NavigationFormFlow.push(context, nextRoutePath);
          },
        ),
      ),
    );
  }
}
