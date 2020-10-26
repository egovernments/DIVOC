import 'package:divoc/navigation_flow/navigation_flow.dart';
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
        routes: _flows,
        builder: (routeInfo) {
          print(routeInfo.currentRouteName);
          //TODO Build form based on current route
          return FlowScreen(
              routeInfo.nextRoutesMeta, routeInfo.currentRoutePath);
        },
      ),
    );
  }
}

const List<String> _flows = [
  '/selectVaccine',

  //Verify Recipient Flow
  '/selectVaccine/verifyRecipient',
  '/selectVaccine/verifyRecipient/preEnroll',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/aadharManually',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/aadharManually/aadharOtp',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/aadharManually/aadharOtp/upcoming',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/scanQR',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/scanQR/aadharOtp',
  '/selectVaccine/verifyRecipient/preEnroll/userDetails/scanQR/aadharOtp/upcoming',

  //EnrollFlow
  '/selectVaccine/enroll',
  '/selectVaccine/enroll/userForm',
  '/selectVaccine/enroll/userForm/govt',
  '/selectVaccine/enroll/userForm/voucher',
  '/selectVaccine/enroll/userForm/voucher/verifyVoucher',
  '/selectVaccine/enroll/userForm/voucher/verifyVoucher/upcoming',
  '/selectVaccine/enroll/userForm/direct',

  //Recipient Queue
  '/selectVaccine/upcoming',
  '/selectVaccine/generateCert',
];
