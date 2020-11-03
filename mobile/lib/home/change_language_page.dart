import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/model/app_session.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ChangeLanguagePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final appSession = context.watch<AppSession>();
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(kToolbarHeight),
        child: DivocHeader(() {
          Navigator.of(context).pop();
        }),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(top: PaddingSize.NORMAL),
            child: Text(
              "Change Language",
              style: Theme.of(context).textTheme.headline6,
            ),
          ),
          Expanded(
            child: DivocForm(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: ListView.builder(
                  itemCount: languageSupport.length,
                  itemBuilder: (context, index) {
                    final currentLanguage = languageSupport[index];
                    return ListTile(
                      selected: currentLanguage.code ==
                          appSession.selectedLanguage.code,
                      title: Text(currentLanguage.name),
                      trailing: Icon(Icons.navigate_next),
                      onTap: () {
                        appSession.changeLanguage(currentLanguage);
                        Navigator.of(context).pop();
                      },
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
