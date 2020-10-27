import 'package:divoc/forms/navigation_flow.dart';
import 'package:flutter/material.dart';

class FlowScreen extends StatelessWidget {
  final List<RouteMeta> routes;
  final String currentPath;

  FlowScreen(this.routes, this.currentPath);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Card(
        child: Container(
          child: ListView.builder(
            itemCount: routes.length,
            itemBuilder: (context, index) {
              return RaisedButton(
                child: Text(routes[index].nextRouteName),
                onPressed: () {
                  NavigationFormFlow.push(
                      context, routes[index].fullNextRoutePath);
                },
              );
            },
          ),
        ),
      ),
    );
  }
}

class CustomNavigatorScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Navigation Flow"),
      ),
      body: NavigationFormFlow(
      //  routes: _flows,
        builder: (routeInfo,arguments) {
          print(routeInfo.currentRouteName);
          //TODO Build form based on current route
          return FlowScreen(
              routeInfo.nextRoutesMeta, routeInfo.currentRoutePath);
        },
      ),
    );
  }
}
