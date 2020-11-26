import {FormCard} from "../../Base/Base";
import {Button} from "react-bootstrap";
import React from "react";
import {useHome} from "../Home";
import {FORM_AADHAR_NUMBER, FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, usePreEnrollment} from "./PreEnrollmentFlow";

export function PreEnrollmentCode(props) {
    const {goNext, goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<Button onClick={() => {
            goNext(FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, {enrollCode: "1234"})
        }}>Pre Enrollment code</Button>} title={"Verify Recipient"}/>
    );
}

export function PreEnrollmentDetails(props) {
    const {goNext, goBack} = usePreEnrollment()

    return (
        <FormCard onBack={() => {
            goBack();
        }} content={<Button onClick={() => {
            goNext(FORM_PRE_ENROLL_DETAILS, FORM_AADHAR_NUMBER, {})
        }}>Pre Enrollment Details</Button>} title={"Verify Recipient"}/>
    );
}
