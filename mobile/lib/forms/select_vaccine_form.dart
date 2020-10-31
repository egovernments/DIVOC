import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class SelectVaccineManuallyForm extends StatelessWidget {
  final RouteInfo _routeInfo;
  final List<ApproveVaccines> approvedVaccines = [
    ApproveVaccines("C-19 MAEIWXZ", "C191500"),
    ApproveVaccines("N-23 EWNJCEJ", "N231502"),
    ApproveVaccines("V018 MAEIWXZ", "V018500"),
    ApproveVaccines("2CEE JRFKLMV", "2CE1515"),
  ];
  final ValueNotifier<ApproveVaccines> valueNotifier = ValueNotifier(null);

  SelectVaccineManuallyForm(this._routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titleVerifyVaccineDetailsManually,
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Padding(
            padding: const EdgeInsets.only(
              top: PaddingSize.LARGE,
              bottom: PaddingSize.LARGE,
            ),
            child: Text(
              DivocLocalizations.of(context).titleSelectApprovedVaccine,
              style: Theme.of(context).textTheme.caption,
            ),
          ),
          ValueListenableBuilder(
            valueListenable: valueNotifier,
            builder: (context, approvedVaccine, child) {
              final dropdownMenus = approvedVaccines
                  .map((e) => DropdownMenuItem<ApproveVaccines>(
                        child: Text(e.name),
                        value: e,
                      ))
                  .toList();
              return DropdownButton<ApproveVaccines>(
                  value: approvedVaccine,
                  items: dropdownMenus,
                  onChanged: (value) {
                    valueNotifier.value = value;
                  });
            },
          ),
          Padding(
            padding: const EdgeInsets.only(
              top: PaddingSize.LARGE,
              bottom: PaddingSize.LARGE,
            ),
            child: Text(
              "BATCH ID",
              style: Theme.of(context).textTheme.caption,
            ),
          ),
          ValueListenableBuilder<ApproveVaccines>(
            valueListenable: valueNotifier,
            builder: (context, value, child) {
              return Text(
                value != null ? value.batchId : "",
              );
            },
          ),
          FormButton(
            text: "Done",
            onPressed: () {
              Navigator.of(context)
                  .pushNamed(_routeInfo.nextRoutesMeta[0].fullNextRoutePath);
            },
          )
        ],
      ),
    );
  }
}

class ApproveVaccines {
  final String name;
  final String batchId;

  ApproveVaccines(this.name, this.batchId);
}
