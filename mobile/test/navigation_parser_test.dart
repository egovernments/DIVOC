import 'package:divoc/parser/parser.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Navigation Routes', () async {
    final navigationFlowParser = NavigationFlowParser();
    final flowTree = navigationFlowParser.buildFlowTree(mapList);
    expect(flowTree, null);
  });

  test('Find Route Routes', () async {
    final navigationFlowParser = NavigationFlowParser();
    final flowTree = navigationFlowParser.buildFlowTree(mapList);
    final searchRouteKey = "vaccineManually";
    final findNode = flowTree.findNode(flowTree, searchRouteKey);
    expect(findNode.routeKey, searchRouteKey);
  });
}

final map = {
  "root": {
    "upcomingRecipients": {
      "metadata": {"label": "Upcoming", "formKey": "upcoming"},
      "nextRoutes": {
        "vaccineManually": {
          "metadata": {
            "label": "Vaccine Manually",
            "formKey": "vaccineManually"
          },
          "nextRoutes": {
            "certifyDetails": {
              "metadata": {"label": "Certify", "formKey": "certifyDetails"},
              "nextRoutes": {
                "upcomingRecipients": {
                  "metadata": {"label": "Upcoming", "formKey": "upcoming"}
                }
              }
            }
          }
        },
        "scanQR": {
          "metadata": {"label": "Scan QR", "formKey": "scanQR"},
          "nextRoutes": {
            "certifyDetails": {
              "metadata": {"label": "Certify", "formKey": "certifyDetails"},
              "nextRoutes": {
                "upcomingRecipients": {
                  "metadata": {"label": "Upcoming", "formKey": "upcoming"}
                }
              }
            }
          }
        }
      }
    }
  }
};

final mapList = {
  "routeKey": "root",
  "metadata": {"label": "root", "formKey": "root"},
  "nextRoutes": [
    {
      "routeKey": "upcomingRecipients",
      "metadata": {"label": "Upcoming", "formKey": "upcoming"},
      "nextRoutes": [
        {
          "routeKey": "vaccineManually",
          "metadata": {
            "label": "Vaccine Manually",
            "formKey": "vaccineManually"
          },
          "nextRoutes": [
            {
              "routeKey": "certifyDetails",
              "metadata": {"label": "Certify", "formKey": "certifyDetails"},
              "nextRoutes": [
                {
                  "routeKey": "upcomingRecipients",
                  "metadata": {"label": "Upcoming", "formKey": "upcoming"}
                }
              ]
            }
          ]
        },
        {
          "routeKey": "scanQR",
          "metadata": {"label": "Scan QR", "formKey": "scanQR"},
          "nextRoutes": [
            {
              "routeKey": "certifyDetails",
              "metadata": {"label": "Certify", "formKey": "certifyDetails"},
              "nextRoutes": [
                {
                  "routeKey": "upcomingRecipients",
                  "metadata": {"label": "Upcoming", "formKey": "upcoming"},
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
