import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/theme.dart';
import 'package:divoc/data_source/network.dart';
import 'package:divoc/forms/new_user_form.dart';
import 'package:divoc/forms/placeholder_text_form.dart';
import 'package:divoc/forms/select_payment_form.dart';
import 'package:divoc/forms/select_vaccine_form.dart';
import 'package:divoc/forms/upcoming_form.dart';
import 'package:divoc/forms/user_details_form.dart';
import 'package:divoc/forms/voucher_verfication_form.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/flow_screen.dart';
import 'package:divoc/home/home_model.dart';
import 'package:divoc/forms/program_selection.dart';
import 'package:divoc/forms/single_field_form.dart';
import 'package:divoc/forms/vaccination_program_form.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/patients.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class OperatorHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var homeRepository = context.watch<HomeRepository>();
    return ChangeNotifierProvider(
      create: (_) => HomeModel(homeRepository),
      builder: (context, widget) {
        return Scaffold(
          appBar: PreferredSize(
            preferredSize: Size.fromHeight(kToolbarHeight),
            child: DivocHeader(),
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
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyAadhaar,
        child: SingleFieldForm(
          title: "Set a unique PIN",
          btnText: "Confirm",
          onNext: (context, value) {
            NavigationFormFlow.push(
                context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
          },
        ),
      );

    case 'upcomingRecipients':
      return UpComingForm(
        onScanClicked: (context, PatientDetails patientDetails) {
          Navigator.of(context).pushNamed(
              routeInfo.nextRoutesMeta[0].fullNextRoutePath,
              arguments: patientDetails);
        },
      );

    case 'vaccineManually':
      return SelectVaccineManuallyForm(routeInfo);

    /*case 'scanQR':
      return DivocForm(
        title: DivocLocalizations.current.titleVerifyRecipient,
        child: SingleFieldForm(
          title: "Your Aadhar Number",
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
      return UpComingForm();

    case 'govt':
      return MessageForm(routeInfo, "Verify Government Payment");

    case 'direct':
      return MessageForm(routeInfo, "Verify Direct Payment");

    case 'verifyVoucher':
      return MessageForm(routeInfo, "Voucher Payment Verified");*/

    default:
      return FlowScreen(routeInfo.nextRoutesMeta, routeInfo.currentRoutePath);
  }
}

const List<String> _flows = [
  //Verify Recipient Flow
  '/upcomingRecipients',
  '/upcomingRecipients/vaccineManually',
  '/upcomingRecipients/vaccineManually/recipientDetails',
  '/upcomingRecipients/vaccineManually/recipientDetails/certify',
  '/upcomingRecipients/vaccineManually/recipientDetails/certify/upcomingRecipients',
  '/upcomingRecipients/scanQR',
  '/upcomingRecipients/scanQR/certify',
  '/upcomingRecipients/scanQR/certify/upcomingRecipients',
];
