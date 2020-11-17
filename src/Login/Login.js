import React, {createContext, useContext, useMemo, useReducer, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.scss"
import Col from "react-bootstrap/Col";
import {DivocFooter, DivocHeader, Loader} from "../Base/Base";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {useHistory} from "react-router";
import Home from "../Home/Home";
import {ApiServices} from "../Services/apiServices";

function PhoneNumberComponent() {
    const {state, requestOtp} = useLogin();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [phoneNumber, setPhoneNumber] = useState(state.mobileNumber)

    const handlePhoneNumberOnChange = (e) => {
        setPhoneNumber(e.target.value)
    }

    return <Col className="phone-container">
        <h2 className="title">Enter Mobile Number</h2>
        <Form className="input-phone">
            <Form.Control className="control" type="phone" placeholder="+91-9876543210" value={phoneNumber}
                          onChange={handlePhoneNumberOnChange}/>
        </Form>
        <Button className="button" disabled={loading} onClick={() => {
            if (!phoneNumber) {
                setError("Invalid phone number")
                return;
            }
            setLoading(true)
            ApiServices.requestOtp(phoneNumber).then(r => {
                setLoading(false)
                requestOtp(phoneNumber)
            }).catch((e) => {
                setLoading(false)
                setError(e.message)
            });
        }}>{loading ? "Loading..." : "Get OTP"}</Button>
        {!loading && error && <p>{error}</p>}
    </Col>;
}

function OTPVerifyComponent() {
    const {state, login} = useLogin();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [otpNumber, setOtpNumber] = useState(state.otp)

    const handlePhoneNumberOnChange = (e) => {
        setOtpNumber(e.target.value)
    }

    return <Col className="phone-container">
        <h2 className="title">Enter OTP</h2>
        <Form className="input-phone">
            <Form.Control className="control" type="mobile" value={otpNumber}
                          onChange={handlePhoneNumberOnChange}/>
        </Form>
        <Button className="button" disabled={loading} onClick={() => {
            if (!otpNumber) {
                setError("Invalid otp")
                return;
            }
            setLoading(true)
            ApiServices.login(state.mobileNumber, otpNumber).then(value => {
                setLoading(false)
                login(otpNumber);
            }).catch((e) => {
                setLoading(false)
                setError(e.message)
            });
        }}>{loading ? "Loading..." : "Login"}</Button>
        {!loading && error && <p>{error}</p>}
    </Col>;
}

const initialState = {mobileNumber: "", otp: ""};

function loginReducer(state, action) {
    switch (action.type) {
        case ACTION_LOGIN:
            return {otp: action.payload.otp, ...state};
        case ACTION_OTP:
            return {mobileNumber: action.payload.mobileNumber};
        default:
            throw new Error();
    }
}

export const ACTION_LOGIN = 'login';
export const ACTION_OTP = 'otp';

const LoginContext = createContext(null);

export function useLogin() {
    const context = useContext(LoginContext)
    const history = useHistory();
    if (!context) {
        throw new Error(`useLogin must be used within a LoginProvider`)
    }
    const [state, dispatch] = context

    const requestOtp = function (mobileNumber) {
        dispatch({type: ACTION_OTP, payload: {mobileNumber: mobileNumber, otp: 0}})
        history.push(`/otp`)
    }

    const login = function (otp) {
        dispatch({type: ACTION_OTP, payload: {otp: otp}})
        history.push(`/home`)
    }

    return {
        state,
        dispatch,
        requestOtp,
        login
    }

}

export function LoginComponent() {
    return <div className={"login-container"}>
        <DivocHeader/>
        <LoginProvider>
            <Router>
                <Switch>
                    <Route path="/" exact component={PhoneNumberComponent}/>
                    <Route path="/otp" exact component={OTPVerifyComponent}/>
                    <Route path="/home" exact component={Home}/>
                </Switch>
            </Router>
        </LoginProvider>
        <DivocFooter/>
    </div>
}

function LoginProvider(props) {
    const [state, dispatch] = useReducer(loginReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <LoginContext.Provider value={value} {...props} />
}
