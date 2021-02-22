import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {FORM_AADHAAR_NUMBER, FORM_AADHAAR_OTP, usePreEnrollment} from "./PreEnrollmentFlow";
import Form from "react-bootstrap/Form";
import "./EnterAadhaarNumber.scss"
import {BaseFormCard} from "../../components/BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";

export function VerifyAadhaarNumber(props) {
    return (
        <BaseFormCard title={"Verify Vaccination Recipient"}>
            <EnterAadhaarNumber/>
        </BaseFormCard>
    )
}

function EnterAadhaarNumber(props) {
    const {state, goNext} = usePreEnrollment()
    const [aadhaarNumber, setAadhaarNumber] = useState(state.identity)

    const handleAadhaarNumberOnChange = (e) => {
        setAadhaarNumber(e.target.value)
    }

    return (
        <div className="aadhaar-container">
            <h5>{getMessageComponent(LANGUAGE_KEYS.ENTER_IDENTITY_NUMBER)}</h5>
            <Form.Control className="control"
                          placeholder="XXXX XXXX XXXX"
                          value={aadhaarNumber}
                          name="mobile"
                          type="number"
                          onChange={handleAadhaarNumberOnChange}/>
            <Button variant="outline-primary" className="action-btn" onClick={() => {
                if (aadhaarNumber) {
                    goNext(FORM_AADHAAR_NUMBER, FORM_AADHAAR_OTP, {aadhaarNumber: aadhaarNumber})
                }
            }}>GENERATE OTP</Button>
        </div>
    );
}

export function VerifyAadhaarOTP(props) {
    return (
        <BaseFormCard title={"Verify Vaccination Recipient"}>
            <EnterAadhaarOTP/>
        </BaseFormCard>
    )
}

function EnterAadhaarOTP(props) {
    const {state, goNext, addToQueue} = usePreEnrollment()
    const [aadhaarOTP, setAadhaarOTP] = useState(state.aadhaarOtp)

    const handleAadhaarOTPOnChange = (e) => {
        setAadhaarOTP(e.target.value)
    }

    return (
        <div className="aadhaar-container">
            <h5>Enter OTP</h5>
            <Form.Control className="control"
                          placeholder="XXXX"
                          value={aadhaarOTP}
                          name="mobile"
                          type="number"
                          onChange={handleAadhaarOTPOnChange}/>
            <Button variant="outline-primary" className="action-btn" onClick={() => {
                if (aadhaarOTP) {
                    addToQueue().then((value) => {
                        goNext(FORM_AADHAAR_OTP, "/", {aadhaarOtp: aadhaarOTP})
                    }).catch((e) => {
                        console.log("Queue: " + e);
                    })
                }
            }}>VERIFY</Button>
        </div>
    );
}

