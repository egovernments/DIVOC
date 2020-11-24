import {FormCard} from "../../Base/Base";
import {Button} from "react-bootstrap";
import React from "react";
import {useHome} from "../Home";
import {FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, usePreEnrollment} from "./PreEnrollmentFlow";

export function AadharNumber(props) {
    const {goNext, goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<Button onClick={() => {
            goNext(FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, {aadharNumber: "56789"})
        }}>AadharNumber</Button>} title={"Verify Recipient"}/>
    );
}

export function AadharOTP(props) {
    const {goNext, goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<Button onClick={() => {
            goNext(FORM_AADHAR_OTP, "/", {aadharOtp: "56789"})
        }}>AadharOTP</Button>} title={"Verify Recipient"}/>
    );
}
