import React, {useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import {ApiServices} from "../Services/apiServices";
import {useLogin} from "./Login";
import {LoginLabels} from "../Base/Constants";
import {ErrorAlert} from "../Base/Base";

export const PHONE_NUMBER_MAX = 10

export function EnterPhoneNumberComponent() {
    const {state, goToVerifyOtp} = useLogin();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [phoneNumber, setPhoneNumber] = useState(state.mobileNumber)

    const handlePhoneNumberOnChange = (e) => {
        if (e.target.value.length <= PHONE_NUMBER_MAX) {
            setPhoneNumber(e.target.value)
        }
    }

    return <Col className="phone-container">
        <h5 className="title">{LoginLabels.WELCOME}</h5>
        <p className="subtitle">{LoginLabels.LOGIN_MSG}</p>
        <Form className="input">
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text>+91</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control className="control"
                              placeholder="9876543210"
                              value={phoneNumber}
                              name="mobile"
                              type="number"
                              onChange={handlePhoneNumberOnChange}/>
            </InputGroup>
        </Form>
        <Button className="button" variant={"primary"} disabled={loading} onClick={() => {
            if (!phoneNumber || phoneNumber.length !== PHONE_NUMBER_MAX) {
                setError(LoginLabels.ERROR_MSG_INVALID_PHONE_NUMBER)
                return;
            }
            setLoading(true)
            ApiServices.requestOtp(phoneNumber).then(r => {
                setLoading(false)
                goToVerifyOtp(phoneNumber)
            }).catch((e) => {
                setLoading(false)
                setError(e.message)
            });
        }}>{loading ? LoginLabels.LABEL_LOADING : LoginLabels.BTN_GET_OTP}</Button>
        {!loading && error && <ErrorAlert message={error} onClose={() => setError(null)}/>}
    </Col>;
}
