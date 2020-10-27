import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../home/home_model.dart';

class SelectProgramScreen extends StatelessWidget {
  final RouteInfo routeInfo;

  SelectProgramScreen(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Column(
            children: [
              SizedBox(
                height: 100,
              ),
              Image.asset(
                ImageAssetPath.SYRINGE,
                width: 50,
              ),
              Padding(
                padding: const EdgeInsets.all(32.0),
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
              SizedBox(
                height: 32,
              ),
              RaisedButton(
                child: Text(DivocLocalizations.of(context).labelNext),
                onPressed: () {
                  var homeModel = context.read<HomeModel>();
                  final nextRoutePath =
                      routeInfo.nextRoutesMeta[0].fullNextRoutePath;
                  Navigator.of(context).pushNamed(nextRoutePath,
                      arguments: homeModel.selectedVaccine);
                },
              )
            ],
          ),
        ),
      ),
    );
  }
}

class ProgramSelectionDropdownWidget extends StatelessWidget {
  final List<VaccineProgram> programs;
  final ValueChanged<String> onChanged;
  final String selectedVaccine;

  ProgramSelectionDropdownWidget(
      {this.selectedVaccine, this.programs, this.onChanged});

  @override
  Widget build(BuildContext context) {
    List<DropdownMenuItem> map = programs
        .map((program) => DropdownMenuItem(
              value: program.id,
              child: ListTile(
                title: Text(program.name),
              ),
            ))
        .toList();

    return DropdownButton(
      icon: Icon(Icons.keyboard_arrow_down_outlined),
      iconSize: 24,
      elevation: 16,
      value: selectedVaccine,
      hint: Text("Select Program"),
      isExpanded: true,
      items: map,
      onChanged: (value) {
        onChanged(value);
      },
    );
  }
}
