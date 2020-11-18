import React, {useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import {ApiServices} from "../Services/apiServices";
import {useLogin} from "./Login";

const PHONE_NUMBER_MAX = 10

export function EnterPhoneNumberComponent() {
    const {state, goToVerifyOtp} = useLogin();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [phoneNumber, setPhoneNumber] = useState(state.mobileNumber)

    const handlePhoneNumberOnChange = (e) => {
        if (e.target.value.length <= PHONE_NUMBER_MAX) {
            setPhoneNumber(e.target.value)
        }
    }

    return <Col className="phone-container">
        <h2 className="title">Enter Mobile Number</h2>
        <Form className="input-phone">

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
        <Button className="button" disabled={loading} onClick={() => {
            if (!phoneNumber || phoneNumber.length !== PHONE_NUMBER_MAX) {
                setError("Invalid phone number")
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
        }}>{loading ? "Loading..." : "Get OTP"}</Button>
        {!loading && error && <p>{error}</p>}
    </Col>;
}
