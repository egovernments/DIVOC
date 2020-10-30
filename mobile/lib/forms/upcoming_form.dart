import 'package:divoc/base/common_widget.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:flutter/material.dart';

class UpComingForm extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titleUpcomingRecipient,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(6.0),
            child: Text(
              "Upcoming Patients",
              style: Theme.of(context).textTheme.headline6,
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: 10,
              itemBuilder: (context, index) {
                return ListTile(
                  leading: CircleAvatar(
                    child: Text("${index + 1}"),
                  ),
                  title: Text("Patient ${index + 1}"),
                  subtitle: Text("Patient Details ${index + 1}"),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
