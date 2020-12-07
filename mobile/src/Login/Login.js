import React, {createContext, useContext, useEffect, useMemo, useReducer} from "react";
import "./Login.scss"
import {useHistory} from "react-router";
import {useKeycloak} from "@react-keycloak/web";

export function LoginComponent() {
    const {keycloak} = useKeycloak();
    const history = useHistory();
    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.login()
        }
    }, []);
    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = "/";
            history.push(redirectUrl)
        }
    }, [keycloak]);
   
    return (
        <div>
            Login
        </div>
    )
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
