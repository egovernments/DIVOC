import {FormCard} from "../../Base/Base";
import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, usePreEnrollment} from "./PreEnrollmentFlow";
import Form from "react-bootstrap/Form";
import "./EnterAadharNumber.scss"
import {BaseFormCard} from "../../components/BaseFormCard";

export function VerifyAadharNumber(props) {
    const {goBack} = usePreEnrollment()
    // return (
    //     <FormCard onBack={() => {
    //         goBack()
    //     }} content={<EnterAadharNumber/>} title={"Verify Recipient"}/>
    // );
    return (

        <BaseFormCard title={"Verify Vaccination Recipient"}>
            <EnterAadharNumber/>
        </BaseFormCard>
    )
}

function EnterAadharNumber(props) {
    const {state, goNext} = usePreEnrollment()
    const [aadharNumber, setAadharNumber] = useState(state.aadharNumber)

    const handleAadharNumberOnChange = (e) => {
        setAadharNumber(e.target.value)
    }

    return (
        <div className="aadhar-container">
            <h5>Enter Aadhar Number</h5>
            <Form.Control className="control"
                          placeholder="XXXX XXXX XXXX"
                          value={aadharNumber}
                          name="mobile"
                          type="number"
                          onChange={handleAadharNumberOnChange}/>
            <Button variant="outline-primary" className="action-btn" onClick={() => {
                if (aadharNumber) {
                    goNext(FORM_AADHAR_NUMBER, FORM_AADHAR_OTP, {aadharNumber: aadharNumber})
                }
            }}>GENERATE OTP</Button>
        </div>
    );
}

export function VerifyAadharOTP(props) {
    const {goBack} = usePreEnrollment()
    // return (
    //     <FormCard onBack={() => {
    //         goBack()
    //     }} content={<EnterAadharOTP/>} title={"Verify Recipient"}/>
    // );
    return (

        <BaseFormCard title={"Verify Vaccination Recipient"}>
            <EnterAadharOTP/>
        </BaseFormCard>
    )
}

function EnterAadharOTP(props) {
    const {state, goNext, addToQueue} = usePreEnrollment()
    const [aadharOTP, setAadharOTP] = useState(state.aadharOtp)

    const handleAadharOTPOnChange = (e) => {
        setAadharOTP(e.target.value)
    }

    return (
        <div className={"aadhar-container"}>
            <h5>Enter OTP</h5>
            <Form.Control className="control"
                          placeholder="XXXX"
                          value={aadharOTP}
                          name="mobile"
                          type="number"
                          onChange={handleAadharOTPOnChange}/>
            <Button variant="outline-primary" className="action-btn" onClick={() => {
                if (aadharOTP) {
                    addToQueue().then((value) => {
                        goNext(FORM_AADHAR_OTP, "/", {aadharOtp: aadharOTP})
                    }).catch((e) => {
                        console.log("Queue: " + e);
                    })
                }
            }}>VERIFY</Button>
        </div>
    );
}

