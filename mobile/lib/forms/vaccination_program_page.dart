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
              padding: const EdgeInsets.all(PaddingSize.LARGE),
              child: Text(
                vaccineProgram.name,
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
            Column(
                children: programFlow
                    .asMap()
                    .map(
                      (index, program) => MapEntry(
                        index,
                        Padding(
                          padding: const EdgeInsets.all(PaddingSize.TINY),
                          child: SizedBox(
                            width: double.infinity,
                            child: OutlineButton(
                              padding: const EdgeInsets.all(PaddingSize.NORMAL),
                              borderSide: BorderSide(
                                color:
                                    Theme.of(context).textTheme.caption.color,
                              ),
                              child: Text(program),
                              onPressed: () {
                                final nextRoutePath = routeInfo
                                    .nextRoutesMeta[index].fullNextRoutePath;
                                NavigationFormFlow.push(context, nextRoutePath);
                              },
                            ),
                          ),
                        ),
                      ),
                    )
                    .values
                    .toList()),
          ],
        ),
      ),
    );
  }
}
