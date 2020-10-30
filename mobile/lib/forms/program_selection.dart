import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../base/common_extension.dart';

import '../home/home_model.dart';

class SelectProgramScreen extends StatelessWidget {
  final RouteInfo routeInfo;

  SelectProgramScreen(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Image.asset(
              ImageAssetPath.SYRINGE,
              width: 50,
            ),
            Padding(
              padding: const EdgeInsets.only(
                top: PaddingSize.LARGE,
                bottom: PaddingSize.LARGE,
              ),
              child: Text(
                DivocLocalizations.of(context).selectProgram,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headline6,
              ),
            ),
            Consumer<HomeModel>(
              builder: (context, homeModel, child) {
                if (homeModel.resourceVaccine.status == Status.LOADING) {
                  return Expanded(
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                final vaccinePrograms = homeModel.resourceVaccine.data;
                return ProgramSelectionDropdownWidget(
                  programs: vaccinePrograms,
                  onTap: (index) {
                    final nextRoutePath =
                        routeInfo.nextRoutesMeta[0].fullNextRoutePath;
                    Navigator.of(context).pushNamed(nextRoutePath,
                        arguments: vaccinePrograms[index]);
                  },
                );
              },
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
            ),
          ],
        ),
      ),
    );
  }
}

class ProgramSelectionDropdownWidget extends StatelessWidget {
  final List<VaccineProgram> programs;
  final ValueChanged<int> onTap;

  ProgramSelectionDropdownWidget({this.programs, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ListView.builder(
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(
              programs[index].name,
            ),
            trailing: Icon(
              Icons.navigate_next,
            ),
            onTap: () {
              onTap(index);
            },
          );
        },
        itemCount: programs != null ? programs.length : 0,
      ),
    );
  }
}
