import 'package:divoc/base/constants.dart';
import 'package:divoc/forms/navigation_flow.dart';
import 'package:divoc/home/home_page.dart';
import 'package:flutter/material.dart';


class CustomDrawer extends StatelessWidget {
  final closeDrawer;

  CustomDrawer(this.closeDrawer);

  final rightArrow = Image.asset(
    ImageAssetPath.ARROW_ICON,
    width: 20,
    height: 20,
  );

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
                            onPressed: this.closeDrawer)),
                    SizedBox(
                      height: 64,
                    ),
                    ListTile(title: Text("Verify Recipient".toUpperCase()), trailing: rightArrow,),
                    ListTile(title: Text("Enroll Recipient".toUpperCase()), trailing: rightArrow,),
                    ListTile(title: Text("Recipient Queue".toUpperCase()), trailing: rightArrow, ),
                    ListTile(title: Text("Change Language".toUpperCase()), trailing: rightArrow,),
                    ListTile(title: Text("Raise an issue".toUpperCase()), trailing: rightArrow,),
                    ListTile(title: Text("Logout".toUpperCase()), trailing: rightArrow,),
                  ]),
            )),
      ),
    );
  }
}

