import 'package:divoc/base/common_widget.dart';
import 'package:divoc/base/constants.dart';
import 'package:divoc/generated/l10n.dart';
import 'package:divoc/parser/parser.dart';
import 'package:flutter/material.dart';

import 'navigation_flow.dart';

class VoucherVerificationForm extends StatelessWidget {
  final FlowTree routeInfo;

  VoucherVerificationForm(this.routeInfo);

  @override
  Widget build(BuildContext context) {
    return DivocForm(
      title: DivocLocalizations.of(context).titlePayment,
      child: Padding(
        padding: const EdgeInsets.all(PaddingSize.NORMAL),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          mainAxisSize: MainAxisSize.max,
          children: [
            Image.asset(
              ImageAssetPath.VOUCHER,
              width: 50,
            ),
            TextFormField(
              textAlign: TextAlign.center,
              keyboardType: TextInputType.phone,
              onSaved: (value) {
                //onNext(context, value);
              },
              validator: (value) {
                var msg = value.isEmpty ? "Cannot be Empty" : null;
                return msg;
              },
              decoration: InputDecoration(
                labelText: "Voucher Number",
                border: OutlineInputBorder(),
              ),
            ),
            Column(
              children: [
                Image.asset(
                  ImageAssetPath.BARCODE_SAMPLE,
                  width: 100,
                ),
                Text(
                  "SCAN BARCODE",
                  style: Theme.of(context).textTheme.caption,
                )
              ],
            ),
            FormButton(
              text: DivocLocalizations.of(context).labelNext,
              onPressed: () {
                NavigationFormFlow.push(
                    context, routeInfo.nextRoutes[0].routeKey);
              },
            )
          ],
        ),
      ),
    );
  }
}
