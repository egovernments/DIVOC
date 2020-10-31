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
  final String title;

  DivocForm({@required this.child, this.title});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      children: [
        title != null ? FormTitle(title) : Container(),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              child: child,
            ),
          ),
        ),
      ],
    );
  }
}

class FormTitle extends StatelessWidget {
  final String title;

  FormTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          border: Border(
              bottom: BorderSide(
        color: Theme.of(context).primaryColor,
        width: 2.0,
      ))),
      child: ListTile(
        title: Text(
          title,
          textAlign: TextAlign.center,
          style: Theme.of(context)
              .textTheme
              .bodyText2
              .copyWith(color: Colors.black),
        ),
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

class FormButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  FormButton({this.text, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return OutlineButton(
      padding: const EdgeInsets.all(PaddingSize.NORMAL),
      borderSide: BorderSide(
        color: Theme.of(context).textTheme.caption.color,
      ),
      child: Text(text),
      onPressed: onPressed,
    );
  }
}
