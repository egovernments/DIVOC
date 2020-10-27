import 'package:divoc/base/common_widget.dart';
import 'package:divoc/forms/new_user_form.dart';
import 'package:divoc/forms/upcoming_form.dart';
import 'package:divoc/forms/user_details_form.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_model.dart';
import 'package:divoc/forms/program_selection.dart';
import 'package:divoc/forms/single_field_form.dart';
import 'package:divoc/forms/vaccination_program_page.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeModel(),
      builder: (context, widget) {
        return Scaffold(
          appBar: PreferredSize(
            preferredSize: Size.fromHeight(kToolbarHeight),
            child: DivocHeader(),
          ),
          body: NavigationFormFlow(
            routes: _flows,
            builder: (routeInfo, arguments) {
              return getWidgetByRouteName(routeInfo, arguments);
            },
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
      return VaccinationProgram(routeInfo, arguments);
    case 'preEnroll':
      return SingleFieldForm(
        title: "Enter Pre Enrolment Code",
        btnText: "Next",
        onNext: (context, value) {
          NavigationFormFlow.push(
              context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
        },
      );
    case 'preEnroll':
      return SingleFieldForm(
        title: "Enter Pre Enrolment Code",
        btnText: "Next",
        onNext: (context, value) {
          NavigationFormFlow.push(
              context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
        },
      );
    case 'verifyUserDetails':
      return UserDetailsScreen(routeInfo);

    case 'aadharManually':
      return SingleFieldForm(
        title: "Enter Aadhar Number",
        btnText: "Generate OTP",
        onNext: (context, value) {
          NavigationFormFlow.push(
              context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
        },
      );

    case 'scanQR':
      return SingleFieldForm(
        title: "Your Aadhar Number",
        btnText: "Generate OTP",
        onNext: (context, value) {
          NavigationFormFlow.push(
              context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
        },
      );

    case 'aadharOtp':
      return SingleFieldForm(
        title: "Enter OTP",
        btnText: "Verify",
        onNext: (context, value) {
          NavigationFormFlow.push(
              context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
        },
      );

    case 'newEnroll':
      return NewUserEnrollForm(routeInfo);

    case 'upcoming':
      return UpComingForm();

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
  '/vaccineProgram/newEnroll/userForm',
  '/vaccineProgram/newEnroll/userForm/govt',
  '/vaccineProgram/newEnroll/userForm/voucher',
  '/vaccineProgram/newEnroll/userForm/voucher/verifyVoucher',
  '/vaccineProgram/newEnroll/userForm/voucher/verifyVoucher/upcoming',
  '/vaccineProgram/newEnroll/userForm/direct',

  //Recipient Queue
  '/vaccineProgram/upcoming',
  '/vaccineProgram/generateCert',
];
