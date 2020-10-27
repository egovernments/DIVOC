import 'package:flutter/material.dart';

class NavigationFormFlow extends StatelessWidget {
  final GlobalKey<NavigatorState> _navigationState = GlobalKey();
  final WidgetFunction builder;
  final List<String> routes;

  NavigationFormFlow({Key key, this.routes, @required this.builder})
      : super(key: key);

  static push(BuildContext context, routePath) {
    Navigator.of(context).pushNamed(routePath);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => !await _navigationState.currentState.maybePop(),
      child: Navigator(
        key: _navigationState,
        onGenerateRoute: (RouteSettings settings) {
          print(settings.name);
          print(settings.arguments);
          return MaterialPageRoute(
            builder: (context) {
              var routeInfo = _buildRouteInfo(settings.name);
              return builder(routeInfo, settings.arguments);
            },
          );
        },
      ),
    );
  }

  RouteInfo _buildRouteInfo(String routePath) {
    final possibleRoutes = _findPossibleRoutes(routes, routePath);
    var dilimeter = "";
    var currentRoute = "/";

    if (routePath.length > 1) {
      dilimeter = "/";
      var split = routePath.split("/");
      currentRoute = split.last;
    }

    var routeMeta = possibleRoutes
        .map((item) => RouteMeta(item, routePath + dilimeter + item))
        .toList();
    return RouteInfo(routeMeta, routePath, currentRoute);
  }
}

typedef WidgetFunction = Widget Function(RouteInfo routeInfo, Object arguments);

class RouteInfo {
  final List<RouteMeta> nextRoutesMeta;
  final String currentRoutePath;
  final String currentRouteName;

  RouteInfo(this.nextRoutesMeta, this.currentRoutePath, this.currentRouteName);
}

class RouteMeta {
  final String nextRouteName;
  final String fullNextRoutePath;

  RouteMeta(this.nextRouteName, this.fullNextRoutePath);
}

List<String> _findPossibleRoutes(List<String> flows, String route) {
  var filterRouteStartWith = flows.where((element) {
    return element.startsWith(route);
  }).toList();

  Set<String> possibleRouteSet = new Set<String>();
  for (var value in filterRouteStartWith) {
    var removedGivenPath =
        route.length == 1 ? value : value.substring(route.length);
    var split = removedGivenPath.split("/");
    //ignore first home route which is empty

    if (split.length > 1) {
      possibleRouteSet.add(split[1]);
    }
  }
  return possibleRouteSet.toList();
}
