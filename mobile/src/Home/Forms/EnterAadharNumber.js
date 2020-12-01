import {FormCard} from "../../Base/Base";
import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, usePreEnrollment} from "./PreEnrollmentFlow";
import Form from "react-bootstrap/Form";
import "./EnterAadharNumber.scss"

export function VerifyAadharNumber(props) {
    const {goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<EnterAadharNumber/>} title={"Verify Recipient"}/>
    );
}

function EnterAadharNumber(props) {
    const {state, goNext} = usePreEnrollment()
    const [aadharNumber, setAadharNumber] = useState(state.aadharNumber)

    const handleAadharNumberOnChange = (e) => {
        setAadharNumber(e.target.value)
    }

    return (
        <div className={"aadhar-container"}>
            <h5>Enter your aadhar number</h5>
            <Form.Control className="control"
                          placeholder="1234 5678 9101"
                          value={aadharNumber}
                          name="mobile"
                          type="number"
                          onChange={handleAadharNumberOnChange}/>
            <Button onClick={() => {
                goNext(FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, {aadharNumber: aadharNumber})
            }}>Verify Aadhar</Button>
        </div>
    );
}

export function VerifyAadharOTP(props) {
    const {goBack} = usePreEnrollment()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<EnterAadharOTP/>} title={"Verify Recipient"}/>
    );
}

function EnterAadharOTP(props) {
    const {state, goNext, addToQueue} = usePreEnrollment()
    const [aadharOTP, setAadharOTP] = useState(state.aadharOtp)

    const handleAadharOTPOnChange = (e) => {
        setAadharOTP(e.target.value)
    }

    return (
        <div className={"aadhar-container"}>
            <h5>Enter your aadhar otp</h5>
            <Form.Control className="control"
                          placeholder="1234"
                          value={aadharOTP}
                          name="mobile"
                          type="number"
                          onChange={handleAadharOTPOnChange}/>
            <Button onClick={() => {
                addToQueue().then((value) => {
                    goNext(FORM_AADHAR_OTP, "/", {aadharOtp: aadharOTP})
                }).catch((e) => {
                    console.log("Queue: " + e);
                })
            }}>Verify OTP</Button>
        </div>
    );
}

