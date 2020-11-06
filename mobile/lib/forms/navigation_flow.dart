import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class NavigationFormFlow extends StatelessWidget {
  final GlobalKey<NavigatorState> _navigationState = GlobalKey();
  final WidgetFunction builder;

  // final List<String> routes;
  final FlowTree flowTree;

  NavigationFormFlow({Key key, @required this.builder, this.flowTree})
      : super(key: key);

  static push(BuildContext context, routePath) {
    Navigator.of(context).pushNamed(routePath);
  }

  static pushAndReplaceRoot(BuildContext context) {
    Navigator.of(context)
        .pushNamedAndRemoveUntil("/", (route) => route.settings.name == "/");
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => !await _navigationState.currentState.maybePop(),
      child: Navigator(
        key: _navigationState,
        onGenerateRoute: (RouteSettings settings) {
          print("Route Name: " + settings.name);
          print(settings.arguments);
          var routeInfo = _buildRouteInfo(settings.name);
          return PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) {
              return builder(routeInfo, settings.arguments);
            },
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(1, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              );
            },
          );
        },
      ),
    );
  }

  RouteInfo _buildRouteInfo(String routeKey) {
    final findNode = flowTree.findNode(
        flowTree, routeKey == '/' ? 'root' : routeKey.replaceAll("/", ""));
    final possibleRoutes =
        findNode == null ? flowTree.nextRoutes : findNode.nextRoutes ?? [];

    var routeMeta = possibleRoutes
        .map((item) => RouteMeta(item.routeKey, item.routeKey))
        .toList();
    return RouteInfo(routeMeta, routeKey, routeKey);
  }
}

class SlidePageRoute extends PageRouteBuilder {}

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
