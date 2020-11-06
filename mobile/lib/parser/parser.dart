import 'package:json_annotation/json_annotation.dart';

part 'parser.g.dart';

class NavigationFlowParser {
/*  FlowTree buildFlowTree(Map<String, dynamic> jsonMap) {
    FlowTree flowTree;
    jsonMap.forEach((key, value) {
      final metadata = FlowMeta.fromJson(value["metadata"]);
      final nextRoute = value["nextRoutes"];
      if (nextRoute == null) {
        flowTree = FlowTree(metadata, []);
      } else {
        //TODO: nextRoute not populated
        final tree = buildFlowTree(nextRoute);
        flowTree = FlowTree(metadata, tree.nextRoutes);
      }
    });
    return flowTree;
  }*/

  FlowTree buildFlowTree(Map<String, dynamic> jsonMap) {
    return FlowTree.fromJson(jsonMap);
  }
}

@JsonSerializable()
class FlowTree {
  @JsonKey(name: 'metadata')
  final FlowMeta flowMeta;

  @JsonKey(name: 'routeKey')
  final String routeKey;

  @JsonKey(name: 'nextRoutes')
  final List<FlowTree> nextRoutes;

  FlowTree(this.flowMeta, this.routeKey, this.nextRoutes);

  factory FlowTree.fromJson(Map<String, dynamic> json) =>
      _$FlowTreeFromJson(json);

  Map<String, dynamic> toJson() => _$FlowTreeToJson(this);

  FlowTree findNode(FlowTree node, String value) {
    if (node.routeKey == value) {
      return node;
    } else if (node.nextRoutes != null) {
      for (FlowTree element in node.nextRoutes) {
        final flowTree = findNode(element, value);
        if (flowTree != null) {
          return flowTree;
        }
      }
    }
    return null;
  }
}

@JsonSerializable()
class FlowMeta {
  final String label;
  final String formKey;

  FlowMeta({this.label, this.formKey});

  factory FlowMeta.fromJson(Map<String, dynamic> json) =>
      _$FlowMetaFromJson(json);

  Map<String, dynamic> toJson() => _$FlowMetaToJson(this);
}

final mapList = {
  "routeKey": "root",
  "metadata": {"label": "root", "formKey": "root"},
  "nextRoutes": [
    {
      "routeKey": "vaccineProgram",
      "metadata": {"label": "Vaccine Program", "formKey": "vaccineProgram"},
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
            }
          ]
        }
      ]
    }
  ]
};

final staffFlow = {
  "routeKey": "root",
  "metadata": {"label": "root", "formKey": "root"},
  "nextRoutes": [
    {
      "routeKey": "vaccineProgram",
      "metadata": {"label": "Vaccine Program", "formKey": "vaccineProgram"},
      "nextRoutes": [
        {
          "routeKey": "preEnroll",
          "metadata": {"label": "Pre enrollment", "formKey": "preEnroll"},
          "nextRoutes": [
            {
              "routeKey": "verifyUserDetails",
              "metadata": {
                "label": "Verify User Details",
                "formKey": "verifyUserDetails"
              },
              "nextRoutes": [
                {
                  "routeKey": "aadharManually",
                  "metadata": {
                    "label": "Aadhaar Manually",
                    "formKey": "aadharManually"
                  },
                  "nextRoutes": [
                    {
                      "routeKey": "aadharOtp",
                      "metadata": {
                        "label": "Verify OTP",
                        "formKey": "aadharOtp"
                      },
                      "nextRoutes": [
                        {
                          "routeKey": "upcoming",
                          "metadata": {
                            "label": "Upcoming Recipient",
                            "formKey": "upcoming"
                          },
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
                      "routeKey": "aadharOtp",
                      "metadata": {
                        "label": "Verify OTP",
                        "formKey": "aadharOtp"
                      },
                      "nextRoutes": [
                        {
                          "routeKey": "upcoming",
                          "metadata": {
                            "label": "Upcoming Recipient",
                            "formKey": "upcoming"
                          },
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "routeKey": "newEnroll",
          "metadata": {"label": "Enroll Form", "formKey": "newEnrollForm"},
          "nextRoutes": [
            {
              "routeKey": "payment",
              "metadata": {"label": "Payment", "formKey": "payment"},
              "nextRoutes": [
                {
                  "routeKey": "govt",
                  "metadata": {"label": "Government", "formKey": "govt"},
                },
                {
                  "routeKey": "voucher",
                  "metadata": {"label": "Voucher", "formKey": "voucher"},
                },
                {
                  "routeKey": "direct",
                  "metadata": {"label": "Direct", "formKey": "govt"},
                }
              ]
            }
          ]
        },
        {
          "routeKey": "upcoming",
          "metadata": {"label": "Upcoming", "formKey": "upcomingForm"},
        },
        {
          "routeKey": "generateCertificate",
          "metadata": {
            "label": "Generate Certificate",
            "formKey": "generateCertificate"
          },
        }
      ]
    }
  ]
};

const List<String> _flows = [
  '/vaccineProgram',

  //Verify Recipient Flow
  '/vaccineProgram',
  '/vaccineProgram/preEnroll',
  '/vaccineProgram/preEnroll/verifyUserDetails',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually/aadharOtp',
  '/vaccineProgram/preEnroll/verifyUserDetails/aadharManually/aadharOtp/upcoming',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR/aadharOtp',
  '/vaccineProgram/preEnroll/verifyUserDetails/scanQR/aadharOtp/upcoming',

  //EnrollFlow
  '/vaccineProgram/newEnroll',
  '/vaccineProgram/newEnroll/payment',
  '/vaccineProgram/newEnroll/payment/govt/upcoming',
  '/vaccineProgram/newEnroll/payment/voucher/upcoming',
  '/vaccineProgram/newEnroll/payment/direct/upcoming',

  //Recipient Queue
  '/vaccineProgram/upcoming',
  '/vaccineProgram/generateCert',
];
