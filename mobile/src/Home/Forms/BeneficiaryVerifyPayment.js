import {BaseFormCard} from "../../components/BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import React from "react";
import {PaymentComponent} from "../../components/WalkEnrollments";
import {usePreEnrollment} from "./PreEnrollmentFlow";
import {FORM_WALK_IN_ENROLL_PAYMENTS} from "../../components/WalkEnrollments/context";

export function BeneficiaryVerifyPayment(props) {
    const {state, goNext, addToQueue} = usePreEnrollment()

    const onContinue = (selectPaymentMode) => {
            addToQueue(selectPaymentMode.key).then((value) => {
                goNext(FORM_WALK_IN_ENROLL_PAYMENTS, "/", {})
            }).catch((e) => {
                console.log("Queue: " + e);
            })
    }
    return (
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.VERIFY_RECIPIENT)}>
                <div className="new-enroll-container text-center">
                    <PaymentComponent onContinue={onContinue} />
                </div>
            </BaseFormCard>
    )
}
