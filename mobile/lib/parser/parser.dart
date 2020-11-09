import 'package:json_annotation/json_annotation.dart';

part 'parser.g.dart';

class NavigationFlowParser {

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
      "routeKey": "upcomingRecipients",
      "metadata": {"label": "Upcoming Recipients", "formKey": "upcomingRecipients"},
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
                            "label": "Done",
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
                            "label": "Done",
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