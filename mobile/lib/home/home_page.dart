import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/forms/new_user_form.dart';
import 'package:divoc/forms/placeholder_text_form.dart';
import 'package:divoc/forms/select_payment_form.dart';
import 'package:divoc/forms/upcoming_form.dart';
import 'package:divoc/forms/user_details_form.dart';
import 'package:divoc/forms/voucher_verfication_form.dart';
import 'package:divoc/home/custom_drawer.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_model.dart';
import 'package:divoc/forms/program_selection.dart';
import 'package:divoc/forms/single_field_form.dart';
import 'package:divoc/forms/vaccination_program_form.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/home/home_repository.dart';
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
        return Scaffold(
          key: _scaffoldKey,
          drawer: CustomDrawer(this.closeDrawer),
          appBar: PreferredSize(
            preferredSize: Size.fromHeight(kToolbarHeight),
            child: DivocHeader(this.openDrawer),
          ),
          body: Theme(
            data: DivocTheme.formTheme,
            child: NavigationFormFlow(
              routes: _flows,
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

Widget getWidgetByRouteName(RouteInfo routeInfo, Object arguments) {
  switch (routeInfo.currentRouteName) {
    case '/':
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
          btnText: "Generate OTP",
          onNext: (context, value) {
            NavigationFormFlow.push(
                context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
          },
        ),
      );

    case 'scanQR':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Your Aadhaar Number",
          btnText: "Generate OTP",
          onNext: (context, value) {
            NavigationFormFlow.push(
                context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
          },
        ),
      );

    case 'aadharOtp':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Enter OTP",
          btnText: "Verify",
          onNext: (context, value) {
            NavigationFormFlow.push(
                context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
          },
        ),
      );

    case 'newEnroll':
      return NewUserEnrollForm(routeInfo);

    case 'payment':
      return SelectPaymentForm(routeInfo);

    case 'voucher':
      return VoucherVerificationForm(routeInfo);

    case 'upcoming':
      return UpComingForm(
        showNextButton: true,
      );

    case 'govt':
      return MessageForm(routeInfo, "Verify Government Payment");

    case 'direct':
      return MessageForm(routeInfo, "Verify Direct Payment");

    case 'verifyVoucher':
      return MessageForm(routeInfo, "Voucher Payment Verified");

    case 'govt':
      return MessageForm(routeInfo, "Verify Government Payment");

    case 'direct':
      return MessageForm(routeInfo, "Verify Direct Payment");

    case 'verifyVoucher':
      return MessageForm(routeInfo, "Voucher Payment Verified");

    default:
      return FlowScreen(routeInfo.nextRoutesMeta, routeInfo.currentRoutePath);
  }
}

const List<String> _flows = [
  '/vaccineProgram',

  //Verify Recipient Flow
  '/vaccineProgram',
  '/vaccineProgram/preEnroll',
  '/vaccineProgram/preEnroll/verifyUserDetails',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually/aadharOtp',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually/aadharOtp/upcoming',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR/aadharOtp',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR/aadharOtp/upcoming',

  //EnrollFlow
  '/vaccineProgram/newEnroll',
  '/vaccineProgram/newEnroll/payment',
  '/vaccineProgram/newEnroll/payment/govt/upcoming',
  '/vaccineProgram/newEnroll/payment/voucher',
  '/vaccineProgram/newEnroll/payment/voucher/verifyVoucher',
  '/vaccineProgram/newEnroll/payment/voucher/verifyVoucher/upcoming',
  '/vaccineProgram/newEnroll/payment/direct/upcoming',

  //Recipient Queue
  '/vaccineProgram/upcoming',
  '/vaccineProgram/generateCert',
];
