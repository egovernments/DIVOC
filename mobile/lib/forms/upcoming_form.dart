import 'dart:async';

import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_repository.dart';
import 'package:divoc/model/patients.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

typedef OnScanClicked = Function(
    BuildContext context, PatientDetails patientDetails);

class UpComingForm extends StatelessWidget {
  final OnScanClicked onScanClicked;
  final bool showNextButton;
  final RouteInfo routeInfo;

  UpComingForm(this.routeInfo,{this.onScanClicked, this.showNextButton = false});

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
          Visibility(
            visible: showNextButton,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: FormButton(
                text: "Next Recipient",
                onPressed: () {
                  if(routeInfo.nextRoutesMeta.length==0){
                    NavigationFormFlow.pushAndReplaceRoot(context);
                  }else{
                    NavigationFormFlow.push(context, routeInfo.nextRoutesMeta[0].fullNextRoutePath);
                  } /*
                  Navigator.of(context).pushNamedAndRemoveUntil(
                      "/", (route) => route.settings.name == "/");*/
                },
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
      padding: const EdgeInsets.all(PaddingSize.NORMAL),
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

class UpcomingInfoWidget extends StatelessWidget {
  final UpcomingInfo _upcomingInfo;

  UpcomingInfoWidget(this._upcomingInfo);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            VaccineInfo(_upcomingInfo.verified, "Verified"),
            VaccineInfo(_upcomingInfo.waiting, "Waiting"),
            VaccineInfo(_upcomingInfo.vaccinated, "Vaccinated"),
          ],
        ),
      ),
    );
  }
}

class UpcomingPatientListWidget extends StatelessWidget {
  final OnScanClicked onScanClicked;
  final List<PatientDetails> patients;

  const UpcomingPatientListWidget(
      {@required this.patients, this.onScanClicked});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      separatorBuilder: (context, index) => Divider(
        indent: 16,
        height: 0,
        endIndent: 16,
        thickness: 0,
        color: Colors.black,
      ),
      shrinkWrap: true,
      itemCount: patients != null ? patients.length : 0,
      itemBuilder: (context, index) {
        var patient = patients[index];
        return ListTile(
          leading: Text(
            patient.srNo,
            textAlign: TextAlign.center,
          ),
          title: Text(patient.name),
          subtitle: Text("${patient.gender}: ${patient.age}"),
          trailing: CircleAvatar(
            child: Image.asset(ImageAssetPath.VACCINE_DE_ACTIVE),
          ),
          onTap: () {
            if (onScanClicked != null) {
              onScanClicked(context, patient);
            }
          },
        );
      },
    );
  }
}

class VaccineInfo extends StatelessWidget {
  final int number;
  final String statName;

  VaccineInfo(this.number, this.statName);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: Colors.blue,
          child: Text(
            number.toString(),
            style: Theme.of(context).textTheme.caption.copyWith(
                  color: Colors.white,
                ),
          ),
          radius: 15,
        ),
        SizedBox(
          width: 8,
        ),
        Text(statName)
      ],
    );
  }
}

class UpcomingPatientModel extends ChangeNotifier {
  Resource<UpcomingPatients> _resourcePatients =
      Resource.idle(data: UpcomingPatients([], UpcomingInfo()));

  Resource<UpcomingPatients> get resourcePatients => _resourcePatients;

  final HomeRepository _homeRepository;

  UpcomingPatientModel(this._homeRepository) {
    getEnrollmentDetails();
  }

  void getEnrollmentDetails() {
    _resourcePatients = Resource.loading("Loading");
    notifyListeners();
    _homeRepository.getPatientDetails("1").then((value) {
      final upcomingPatients = UpcomingPatients(value, _buildInfo(value));
      _resourcePatients = Resource.completed(upcomingPatients);
      notifyListeners();
    }).catchError((Object error) {
      _resourcePatients = handleError<UpcomingPatients>(error);
      notifyListeners();
    });
  }

  UpcomingInfo _buildInfo(List<PatientDetails> patients) {
    int verified = 0;
    int waiting = 0;
    int vaccinated = 0;
    for (var value in patients) {
      switch (value.status) {
        case "waiting":
          waiting += 1;
          break;
        case "verified":
          verified += 1;
          break;
        case "vaccinated":
          vaccinated += 1;
          break;
      }
    }
    return UpcomingInfo(
        verified: verified, waiting: waiting, vaccinated: vaccinated);
  }
}

class UpcomingPatients {
  final List<PatientDetails> patients;
  final UpcomingInfo upcomingInfo;

  UpcomingPatients(this.patients, this.upcomingInfo);
}

class UpcomingInfo {
  final int verified;
  final int waiting;
  final int vaccinated;

  UpcomingInfo({this.verified = 0, this.waiting = 0, this.vaccinated = 0});
}
