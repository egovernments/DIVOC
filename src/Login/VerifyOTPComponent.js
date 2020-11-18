import {useAuthorizedUser} from "../authentication";
import React, {useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {ApiServices} from "../Services/apiServices";
import {useLogin} from "./Login";

const OTP_NUMBER_MAX = 4

export function VerifyOTPComponent() {
    const {state, goToHome} = useLogin();
    const {saveUserToken} = useAuthorizedUser();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [otpNumber, setOtpNumber] = useState(state.otp)

    const handlePhoneNumberOnChange = (e) => {
        if (e.target.value.length <= OTP_NUMBER_MAX) {
            setOtpNumber(e.target.value)
        }
    }

    return <Col className="phone-container">
        <h2 className="title">Enter OTP</h2>
        <Form className="input-phone">
            <Form.Control className="control" type="number" value={otpNumber}
                          onChange={handlePhoneNumberOnChange}/>
        </Form>
        <Button className="button" disabled={loading} onClick={() => {
            if (!otpNumber || otpNumber.length !== OTP_NUMBER_MAX) {
                setError("Invalid otp")
                return;
            }
            setLoading(true)
            ApiServices.login(state.mobileNumber, otpNumber).then(value => {
                setLoading(false)
                goToHome(otpNumber);
                saveUserToken(value)
            }).catch((e) => {
                setLoading(false)
                setError(e.message)
            });
        }}>{loading ? "Loading..." : "Login"}</Button>
        {!loading && error && <p>{error}</p>}
    </Col>;
}
