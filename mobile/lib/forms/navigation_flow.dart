import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class NavigationFormFlow extends StatelessWidget {
  final GlobalKey<NavigatorState> _navigationState = GlobalKey();
  final WidgetFunction builder;
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
          print("Route Name: 2" + settings.name);
          print(settings.arguments);
          final routeInfo = _buildFlowTree(settings.name);
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

  FlowTree _buildFlowTree(String routeKey) {
    final findNode = flowTree.findNode(
        flowTree, routeKey == '/' ? 'root' : routeKey.replaceAll("/", ""));
    return findNode;
  }
}

typedef WidgetFunction = Widget Function(FlowTree routeInfo, Object arguments);
