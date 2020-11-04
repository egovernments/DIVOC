import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/model/app_session.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ChangeLanguagePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(kToolbarHeight),
        child: DivocHeader(() {
          Navigator.of(context).pop();
        }),
      ),
      body: Column(
        children: [
          SizedBox(
            height: kToolbarHeight,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                DivocLocalizations.of(context).titleChangeLanguage,
                style: Theme.of(context).textTheme.headline6,
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Consumer<AppSession>(
            builder: (context, value, child) => Expanded(
              child: DivocForm(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: ListView.builder(
                    itemCount: languageSupport.length,
                    itemBuilder: (context, index) {
                      final currentLanguage = languageSupport[index];
                      return ListTile(
                        selected:
                            currentLanguage.code == value.selectedLanguage.code,
                        title: Text(currentLanguage.name),
                        trailing: Icon(Icons.navigate_next),
                        onTap: () {
                          value.changeLanguage(currentLanguage);
                          //Navigator.of(context).pop();
                        },
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
