import 'dart:async';

import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/forms/upcoming_form.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/patients.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

typedef OnScanClicked = Function(
    BuildContext context, PatientDetails patientDetails);

class OperatorUpComingForm extends StatelessWidget {
  final OnScanClicked onScanClicked;
  final bool showNextButton;

  OperatorUpComingForm({this.onScanClicked, this.showNextButton = false});

  @override
  Widget build(BuildContext context) {
    var homeRepository = context.watch<HomeRepository>();
    var localizations = DivocLocalizations.of(context);
    final ValueNotifier<UpcomingInfo> upcomingValueNotifier =
        ValueNotifier(UpcomingInfo());

    return ChangeNotifierProvider(
      create: (_) => UpcomingPatientModel(homeRepository),
      child: Column(
        children: [
          FormTitle(localizations.titleUpcomingRecipient),
          Padding(
            padding: const EdgeInsets.only(top: PaddingSize.TINY),
          ),
          ValueListenableBuilder(
            valueListenable: upcomingValueNotifier,
            builder: (BuildContext context, UpcomingInfo value, Widget child) {
              return Padding(
                padding: const EdgeInsets.only(
                  left: PaddingSize.NORMAL,
                  right: PaddingSize.NORMAL,
                ),
                child: UpcomingInfoWidget(value),
              );
            },
          ),
          Expanded(
            child: Consumer<UpcomingPatientModel>(
              builder: (context, upcomingModel, child) {
                final resourceUpcomingPatients = upcomingModel.resourcePatients;
                if (resourceUpcomingPatients.status == Status.LOADING) {
                  return Center(
                    child: CircularProgressIndicator(),
                  );
                }

                if (resourceUpcomingPatients.status == Status.ERROR) {
                  return Center(child: Text(resourceUpcomingPatients.message));
                }

                if (resourceUpcomingPatients.data.patients.isEmpty) {
                  return Center(child: Text("No upcoming patients."));
                }

                scheduleMicrotask(() {
                  upcomingValueNotifier.value =
                      resourceUpcomingPatients.data.upcomingInfo;
                });

                return buildUpcomingList(
                    context, resourceUpcomingPatients.data.patients);
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(
                left: PaddingSize.NORMAL,
                right: PaddingSize.NORMAL,
                bottom: PaddingSize.NORMAL),
            child: Card(
              child: ListTile(
                leading: Image.asset(ImageAssetPath.VACCINE_ACTIVE),
                title: RichText(
                  text: TextSpan(
                    style: DefaultTextStyle.of(context).style,
                    children: [
                      TextSpan(
                        text: "64 ",
                        style: Theme.of(context).textTheme.bodyText1.copyWith(
                              color: Theme.of(context).primaryColor,
                            ),
                      ),
                      TextSpan(text: "vaccines")
                    ],
                  ),
                ),
                subtitle: RichText(
                  text: TextSpan(
                    style: DefaultTextStyle.of(context).style,
                    text: "Administered on: ",
                    children: [
                      TextSpan(
                        text: "20 October 2020",
                        style: Theme.of(context).textTheme.bodyText1.copyWith(
                              color: Colors.black,
                            ),
                      )
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Padding buildUpcomingList(
      BuildContext context, List<PatientDetails> upcomingPatients) {
    return Padding(
      padding: const EdgeInsets.only(
        left: PaddingSize.NORMAL,
        right: PaddingSize.NORMAL,
      ),
      child: Card(
        child: Column(
          children: [
            buildHeader(context),
            Divider(
              indent: 16,
              endIndent: 16,
              height: 0,
              thickness: 0,
              color: Colors.black,
            ),
            Expanded(
              child: UpcomingPatientListWidget(
                onScanClicked: onScanClicked,
                patients: upcomingPatients,
              ),
            ),
          ],
        ),
      ),
    );
  }

  ListTile buildHeader(BuildContext context) {
    final headerTextTheme = Theme.of(context)
        .textTheme
        .bodyText2
        .copyWith(fontWeight: FontWeight.bold);
    return ListTile(
      leading: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "NO.",
            textAlign: TextAlign.center,
            style: headerTextTheme,
          ),
        ],
      ),
      title: Text(
        "NAME",
        style: headerTextTheme,
      ),
    );
  }
}
