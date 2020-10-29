import 'package:divoc/base/constants.dart';
import 'package:divoc/home/home_page.dart';
import 'package:flutter/material.dart';


class CustomDrawer extends StatelessWidget {
  final HomePage homePage;

  CustomDrawer(this.homePage);

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 16,
      child: SafeArea(
        child: ConstrainedBox(
            constraints: const BoxConstraints(minWidth: double.infinity),
            child: Padding(
              padding: EdgeInsets.only(top: 20, right: 10, left: 40),
              child: Column(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Align(
                        alignment: Alignment.topRight,
                        child: FlatButton(
                            child: Image.asset(
                              ImageAssetPath.CLOSE_ICON,
                              width: 25,
                              height: 25,
                            ),
                            onPressed: homePage.closeDrawer)),
                    SizedBox(
                      height: 64,
                    ),
                    DrawerMenuItem("Verify Recipient", null),
                    DrawerMenuItem("Enroll Recipient", null),
                    DrawerMenuItem("Recipient Queue", null),
                    DrawerMenuItem("Change Language", null),
                    DrawerMenuItem("Raise an issue", null),
                    DrawerMenuItem("Logout", null),
                  ]),
            )),
      ),
    );
  }
}

class DrawerMenuItem extends StatelessWidget {
  String text;
  VoidCallback handler;

  DrawerMenuItem(this.text, this.handler);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Align(
          alignment: Alignment.topLeft,
          child: FlatButton(
            onPressed: handler,
            child: Text(text.toUpperCase()),
          )),
      Expanded(
          child: Align(
              alignment: Alignment.topRight,
              child: Image.asset(
                ImageAssetPath.ARROW_ICON,
                width: 20,
                height: 20,
              ))),
    ]);
  }
}
