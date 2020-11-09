import 'package:divoc/base/common_widget.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class FlowScreen extends StatelessWidget {
  final FlowTree routes;

  FlowScreen(this.routes);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Card(
        child: Container(
          child: ListView.builder(
            itemCount: routes.nextRoutes.length,
            itemBuilder: (context, index) {
              return FormButton(
                text: routes.nextRoutes[index].flowMeta.label,
                onPressed: () {
                  NavigationFormFlow.push(
                      context, routes.nextRoutes[index].routeKey);
                },
              );
            },
          ),
        ),
      ),
    );
  }
}
