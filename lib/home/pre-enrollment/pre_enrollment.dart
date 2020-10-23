import 'package:flutter/material.dart';

class NewPreEnrollment extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: PageViewDemo(),
      ),
    );
  }
}

class Appointments extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: Text("Appointments"),
      ),
    );
  }
}

class PageViewDemo extends StatefulWidget {
  @override
  _PageViewDemoState createState() => _PageViewDemoState();
}

class _PageViewDemoState extends State<PageViewDemo> {
  PageController _controller = PageController(
    initialPage: 0,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        PageView(
          controller: _controller,
          children: [
            Center(
              child: Text("Pre-enrollment Code"),
            ),
            Center(
              child: Text("Aadhar"),
            ),
            Center(
              child: Text("Send for vaccination"),
            ),
          ],
        ),
        RaisedButton(
          child: Text("Next"),
          onPressed: () {
            double value = _controller.page;
            print(value);
            _controller.jumpToPage(value.toInt() + 1);
          },
        ),
      ],
    );
  }
}
