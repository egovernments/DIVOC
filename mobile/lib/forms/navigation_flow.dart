import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class FormNavigator extends StatefulWidget {
  final WidgetFunction builder;
  final FlowTree flowTree;
  final GlobalKey<NavigatorState> _navigationState = GlobalKey();

  FormNavigator({Key key, @required this.builder, this.flowTree})
      : super(key: key);

  static FormNavigatorState of(BuildContext context) {
    return context.findAncestorStateOfType<FormNavigatorState>();
  }

  @override
  FormNavigatorState createState() => FormNavigatorState();
}

class FormNavigatorState extends State<FormNavigator> {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async =>
          !await widget._navigationState.currentState.maybePop(),
      child: Navigator(
        key: widget._navigationState,
        onGenerateRoute: (RouteSettings settings) {
          print("Route Name: 2" + settings.name);
          print(settings.arguments);
          final routeInfo = _buildFlowTree(settings.name);
          return PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) {
              return widget.builder(routeInfo, settings.arguments);
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
    final findNode = widget.flowTree.findNode(widget.flowTree,
        routeKey == '/' ? 'root' : routeKey.replaceAll("/", ""));
    return findNode;
  }

  push(String routePath) {
    widget._navigationState.currentState.pushNamed(routePath);
  }

  pushAndReplaceRoot() {
    widget._navigationState.currentState
        .pushNamedAndRemoveUntil("/", (route) => route.settings.name == "/");
  }
}

typedef WidgetFunction = Widget Function(FlowTree routeInfo, Object arguments);
