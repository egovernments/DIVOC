import 'package:divoc/base/constants.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/home/home_page.dart';
import 'package:flutter/material.dart';

class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.withOpacity(0.5),
      child: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class DivocForm extends StatelessWidget {
  final Widget child;

  DivocForm({@required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        child: child,
      ),
    );
  }
}

class DivocHeader extends StatelessWidget {
  final bool showHeaderMenu;
  final bool showHelpMenu;
  final openDrawer;
  DivocHeader(this.openDrawer, {this.showHeaderMenu = true, this.showHelpMenu = true});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        child: SizedBox(
          height: 50,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                flex: 7,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Image.asset(ImageAssetPath.DIVOC_LOGO),
                ),
              ),
              Visibility(
                visible: showHelpMenu,
                child: Expanded(
                  flex: 1,
                  child: SizedBox(
                    width: 25,
                    height: 25,
                    child: Image.asset(ImageAssetPath.HEADER_HELP),
                  ),
                ),
              ),
              Visibility(
                visible: showHeaderMenu,
                child: Expanded(
                  flex: 2,
                  child: FlatButton(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: SizedBox(
                        width: 40,
                        height: 40,
                        child: Image.asset(ImageAssetPath.HEADER_MENU),
                      ),
                    ),
                    onPressed: () => { if(this.openDrawer!=null) this.openDrawer()},
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class DivocFooter extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var themeData = Theme.of(context);
    return Container(
      color: themeData.primaryColorLight,
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              DivocLocalizations.of(context).tAndC,
              style: themeData.textTheme.caption
                  .copyWith(color: themeData.primaryColor),
            ),
          ),
        ],
      ),
    );
  }
}
