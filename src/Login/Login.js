import React, {createContext, useContext, useMemo, useReducer} from "react";
import "./Login.scss"
import {DivocFooter, DivocHeader} from "../Base/Base";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {useHistory} from "react-router";
import {VerifyOTPComponent} from "./VerifyOTPComponent";
import {EnterPhoneNumberComponent} from "./EnterPhoneNumberComponent";

export function LoginComponent() {
    return <div className={"login-container"}>
        <DivocHeader/>
        <LoginProvider>
            <Router>
                <Switch>
                    <Route path="/" exact component={EnterPhoneNumberComponent}/>
                    <Route path="/otp" exact component={VerifyOTPComponent}/>
                </Switch>
            </Router>
        </LoginProvider>
        <DivocFooter/>
    </div>
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

    const goToVerifyOtp = function (mobileNumber) {
        dispatch({type: ACTION_OTP, payload: {mobileNumber: mobileNumber, otp: ""}})
        history.push(`/otp`)
    }

    const goToHome = function (otp) {
        dispatch({type: ACTION_OTP, payload: {otp: otp}})
        history.replace(`/`)
    }

    return {
        state,
        dispatch,
        goToVerifyOtp,
        goToHome
    }

}

function LoginProvider(props) {
    const [state, dispatch] = useReducer(loginReducer, initialState)
    const value = useMemo(() => [state, dispatch], [state])
    return <LoginContext.Provider value={value} {...props} />
}
