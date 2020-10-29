import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:flutter/material.dart';

class VaccinationProgramForm extends StatelessWidget {
  final VaccineProgram vaccineProgram;
  final RouteInfo routeInfo;

  final programFlow = [
    "Verify recipient",
    "Enroll Recipient",
    "Recipient Queue",
    "Generate Certificates"
  ];

  VaccinationProgramForm(this.routeInfo, this.vaccineProgram);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: [
            Image.asset(
              ImageAssetPath.VACCINE_PROGRAM,
              width: 50,
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                vaccineProgram.name,
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: programFlow.length,
                itemBuilder: (BuildContext context, int index) {
                  return RaisedButton(
                    child: Text(programFlow[index]),
                    onPressed: () {
                      final nextRoutePath =
                          routeInfo.nextRoutesMeta[index].fullNextRoutePath;
                      NavigationFormFlow.push(context, nextRoutePath);
                    },
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
