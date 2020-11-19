import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/base/utils.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_model.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeModel(),
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: Size.fromHeight(kToolbarHeight),
          child: DivocHeader(
            showHeaderMenu: true,
            showHelpMenu: true,
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Card(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: Column(
                  children: [
                    SizedBox(
                      height: 100,
                    ),
                    Image(
                      width: 50,
                      image: AssetImage(ImageAssetPath.SYRINGE),
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
                        return ProgramSelectionWidget(
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
                        //TODO Navigate to new screen
                      },
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class ProgramSelectionWidget extends StatelessWidget {
  final List<VaccineProgram> programs;
  final ValueChanged<String> onChanged;
  final String selectedVaccine;

  ProgramSelectionWidget({this.selectedVaccine, this.programs, this.onChanged});

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
