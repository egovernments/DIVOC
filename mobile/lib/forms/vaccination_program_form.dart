import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

class VaccinationProgramForm extends StatelessWidget {
  final VaccineProgram vaccineProgram;
  final FlowTree routeInfo;

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
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
            Column(
              children: routeInfo.nextRoutes
                  .asMap()
                  .map(
                    (index, program) => MapEntry(
                      index,
                      buildButton(context, program),
                    ),
                  )
                  .values
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildButton(BuildContext context, FlowTree flowTree) {
    return Padding(
      padding: const EdgeInsets.all(PaddingSize.TINY),
      child: SizedBox(
        width: double.infinity,
        child: FormButton(
          text: flowTree.flowMeta.label,
          onPressed: () {
            final nextRoutePath = flowTree.routeKey;
            NavigationFormFlow.push(context, nextRoutePath);
          },
        ),
      ),
    );
  }
}
