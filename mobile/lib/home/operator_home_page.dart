import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/forms/certify_details_form.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/forms/operator_upcoming_form.dart';
import 'package:divoc/forms/select_vaccine_form.dart';
import 'package:divoc/forms/single_field_form.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/custom_drawer.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_model.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:divoc/model/patients.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class OperatorHomePage extends StatelessWidget {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  void openDrawer() {
    _scaffoldKey.currentState.openDrawer();
  }

  void closeDrawer() {
    if (_scaffoldKey.currentState.isDrawerOpen) {
      _scaffoldKey.currentState.openEndDrawer();
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeRepository = context.watch<HomeRepository>();
    final authRepository = context.watch<AuthRepository>();
    return ChangeNotifierProvider(
      create: (_) => HomeModel(homeRepository),
      builder: (context, widget) {
        return Theme(
          data: DivocTheme.operatorTheme,
          child: Scaffold(
            key: _scaffoldKey,
            drawer: CustomDrawer(this.closeDrawer),
            appBar: PreferredSize(
              preferredSize: Size.fromHeight(kToolbarHeight),
              child: DivocHeader(this.openDrawer),
            ),
            body: FormNavigator(
              flowTree: FlowTree.fromJson(mapList),
              builder: (routeInfo, arguments) {
                return getWidgetByRouteName(
                    authRepository, routeInfo, arguments);
              },
            ),
          ),
        );
      },
    );
  }
}

Widget getWidgetByRouteName(
    AuthRepository authRepository, FlowTree routeInfo, Object arguments) {
  switch (routeInfo.routeKey) {
    case 'root':
      var userPin = authRepository.getPin;
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyAadhaar,
        child: SingleFieldForm(
          title: userPin != null && userPin.isNotEmpty
              ? "Enter PIN"
              : "Set unique PIN",
          btnText: routeInfo.nextRoutes[0].flowMeta.label,
          onNext: (context, value) {
            authRepository.setPin = value;
            FormNavigator.of(context).push(routeInfo.nextRoutes[0].routeKey);
          },
        ),
      );

    case 'upcomingRecipients':
      return OperatorUpComingForm(
        onScanClicked: (context, PatientDetails patientDetails) {
          Navigator.of(context).pushNamed(routeInfo.nextRoutes[0].routeKey,
              arguments: patientDetails);
        },
      );

    case 'vaccineManually':
      return SelectVaccineManuallyForm(routeInfo);

    case 'certifyDetails':
      return CertifyDetailsForm(routeInfo);

    default:
      return FlowScreen(routeInfo);
  }
}
