import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/forms/new_user_form.dart';
import 'package:divoc/forms/placeholder_text_form.dart';
import 'package:divoc/forms/program_selection.dart';
import 'package:divoc/forms/select_payment_form.dart';
import 'package:divoc/forms/single_field_form.dart';
import 'package:divoc/forms/upcoming_form.dart';
import 'package:divoc/forms/user_details_form.dart';
import 'package:divoc/forms/vaccination_program_form.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/custom_drawer.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_model.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomePage extends StatelessWidget {
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
    var homeRepository = context.watch<HomeRepository>();
    return ChangeNotifierProvider(
      create: (_) => HomeModel(homeRepository),
      builder: (context, widget) {
        return Theme(
          data: DivocTheme.formTheme,
          child: Scaffold(
            key: _scaffoldKey,
            drawer: CustomDrawer(this.closeDrawer),
            appBar: PreferredSize(
              preferredSize: Size.fromHeight(kToolbarHeight),
              child: DivocHeader(this.openDrawer),
            ),
            body: FormNavigator(
              flowTree: FlowTree.fromJson(staffFlow),
              builder: (routeInfo, arguments) {
                return getWidgetByRouteName(routeInfo, arguments);
              },
            ),
          ),
        );
      },
    );
  }
}

Widget getWidgetByRouteName(FlowTree routeInfo, Object arguments) {
  switch (routeInfo.routeKey) {
    case 'root':
      return SelectProgramScreen(routeInfo);
    case 'vaccineProgram':
      return VaccinationProgramForm(routeInfo, arguments);
    case 'preEnroll':
      return PreEnrollmentForm(routeInfo);
    case 'verifyUserDetails':
      return UserDetailsForm(routeInfo, arguments);

    case 'aadharManually':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Enter Aadhar Number",
          btnText: routeInfo.nextRoutes[0].flowMeta.label,
          onNext: (context, value) {
            FormNavigator.of(context).push(routeInfo.nextRoutes[0].routeKey);
          },
        ),
      );

    case 'scanQR':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Your Aadhaar Number",
          btnText: routeInfo.nextRoutes[0].flowMeta.label,
          onNext: (context, value) {
            FormNavigator.of(context).push(routeInfo.nextRoutes[0].routeKey);
          },
        ),
      );

    case 'aadharOtp':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Enter OTP",
          btnText: routeInfo.nextRoutes[0].flowMeta.label,
          onNext: (context, value) {
            FormNavigator.of(context).push(routeInfo.nextRoutes[0].routeKey);
          },
        ),
      );

    case 'newEnroll':
      return NewUserEnrollForm(routeInfo);

    case 'payment':
      return SelectPaymentForm(routeInfo);

    case 'voucher':
      return UpComingForm(
        routeInfo,
        showNextButton: true,
      );

    case 'upcoming':
      return UpComingForm(
        routeInfo,
        showNextButton: true,
      );

    case 'direct':
      return UpComingForm(
        routeInfo,
        showNextButton: true,
      );

    case 'verifyVoucher':
      return MessageForm(routeInfo, "Voucher Payment Verified");

    case 'govt':
      return MessageForm(routeInfo, "Verify Government Payment");

    case 'direct':
      return MessageForm(routeInfo, "Verify Direct Payment");

    default:
      return FlowScreen(routeInfo);
  }
}
