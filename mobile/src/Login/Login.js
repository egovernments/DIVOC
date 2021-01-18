import React, {createContext, useContext, useEffect} from "react";
import "./Login.scss"
import {useHistory} from "react-router";
import {useKeycloak} from "@react-keycloak/web";
import config from "config.json"

export function LoginComponent() {
    const {keycloak} = useKeycloak();
    const history = useHistory();

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = config.urlPath + "/";
            history.push(redirectUrl)
        } else {
            keycloak.login()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keycloak]);

    return (
        <div>
            Login
        </div>
    )
}

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
