import 'package:divoc/base/utils.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/pre-enrollment/pre_enrollment.dart';
import 'package:divoc/login/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthRepository>();

    final tabsList = [
      Pair("Appointment", Appointments()),
      Pair("New Pre", NewPreEnrollment())
    ];

    return DefaultTabController(
      length: tabsList.length,
      initialIndex: 1,
      child: Scaffold(
        appBar: AppBar(
          title: Text(DivocLocalizations.of(context).title),
          bottom: TabBar(
            tabs: tabsList.map((pair) => Tab(text: pair.first)).toList(),
          ),
        ),
        body: TabBarView(
          physics: NeverScrollableScrollPhysics(),
          children: tabsList.map((pair) => pair.second).toList(),
        ),
      ),
    );
  }
}
