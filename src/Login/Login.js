import React, {createContext, useContext, useMemo, useReducer, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.scss"
import Col from "react-bootstrap/Col";
import {DivocFooter, DivocHeader} from "../Base/Base";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {useHistory} from "react-router";
import Home from "../Home/Home";

function PhoneNumberComponent() {
    const {state, verifyOtp} = useLogin();
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
        <Button className="button" onClick={() => {
            verifyOtp(phoneNumber)
        }}>Get OTP</Button>
    </Col>;
}

function OTPVerifyComponent() {
    const {state, login} = useLogin();
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
        <Button className="button" onClick={() => {
            login(otpNumber);
        }}>Login</Button>
    </Col>;
}

const initialState = {mobileNumber: 0, otp: 0};

function loginReducer(state, action) {
    switch (action.type) {
        case 'login':
            return {otp: action.payload.otp, ...state};
        case 'otp':
            return {mobileNumber: action.payload.mobileNumber};
        default:
            throw new Error();
    }
}

const LoginContext = createContext(null);

export function useLogin() {
    const context = useContext(LoginContext)
    const history = useHistory();
    if (!context) {
        throw new Error(`useLogin must be used within a LoginProvider`)
    }
    const [state, dispatch] = context

    const verifyOtp = function (mobileNumber) {
        dispatch({type: 'otp', payload: {mobileNumber: mobileNumber, otp: 0}})
        history.push(`/otp`)
    }

    const login = function (otp) {
        dispatch({type: 'login', payload: {otp: otp}})
        history.push(`/home`)
    }

    return {
        state,
        dispatch,
        verifyOtp,
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
