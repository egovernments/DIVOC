import * as React from 'react'
import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'
import config from "../config.json"

const Login = () => {
    const {keycloak} = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.redirectUri = window.location.origin + config.urlPath;
            keycloak.login()
        }
    }, [keycloak]);

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = config.urlPath;
            navigate.push(redirectUrl)
        }
    }, [keycloak, navigate]);

    return (
        <div>
            Login
        </div>
    )
};

export default Login