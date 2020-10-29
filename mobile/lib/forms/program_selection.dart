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
          mainAxisAlignment: MainAxisAlignment.spaceAround,
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
                if (homeModel.state.status == Status.LOADING) {
                  return CircularProgressIndicator();
                }
                return ProgramSelectionDropdownWidget(
                  programs: homeModel.state.data,
                  selectedVaccine: homeModel.selectedVaccine,
                  onChanged: (value) {
                    homeModel.vaccineSelected(value);
                  },
                );
              },
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
            ),
            RaisedButton(
              child: Text(DivocLocalizations.of(context).labelNext),
              onPressed: () {
                var homeModel = context.read<HomeModel>();
                if (homeModel.selectedVaccine != null) {
                  final nextRoutePath =
                      routeInfo.nextRoutesMeta[0].fullNextRoutePath;
                  Navigator.of(context).pushNamed(nextRoutePath,
                      arguments: homeModel.selectedVaccine);
                } else {
                  context.showSnackbarMessage(
                      DivocLocalizations.of(context).programSelectError);
                }
              },
            )
          ],
        ),
      ),
    );
  }
}

class ProgramSelectionDropdownWidget extends StatelessWidget {
  final List<VaccineProgram> programs;
  final ValueChanged<VaccineProgram> onChanged;
  final VaccineProgram selectedVaccine;

  ProgramSelectionDropdownWidget(
      {this.selectedVaccine, this.programs, this.onChanged});

  @override
  Widget build(BuildContext context) {
    final defaultTextColor = Theme.of(context).textTheme.caption.color;
    return Expanded(
      child: ListView.builder(
        itemBuilder: (context, index) {
          final selectedColor = selectedVaccine != null &&
                  programs[index].id == selectedVaccine.id
              ? Colors.blue
              : defaultTextColor;
          return ListTile(
            title: Text(
              programs[index].name,
              style: TextStyle(color: selectedColor),
            ),
            trailing: Icon(
              Icons.navigate_next,
              color: selectedColor,
            ),
            onTap: () {
              onChanged(programs[index]);
            },
          );
        },
        itemCount: programs.length,
      ),
    );
  }
}
