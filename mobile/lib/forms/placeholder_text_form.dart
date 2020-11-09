import 'package:divoc/base/common_widget.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class MessageForm extends StatelessWidget {
  final FlowTree routeInfo;
  final String message;

  MessageForm(this.routeInfo, this.message);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
        title: "Verify Payment",
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            Expanded(
              child: Center(
                child: Text(
                  message,
                  style: Theme.of(context).textTheme.headline6,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: FormButton(
                text: "Next",
                onPressed: () {
                  FormNavigator.of(context).push(routeInfo.nextRoutes[0].routeKey);
                },
              ),
            )
          ],
        ));
  }
}
