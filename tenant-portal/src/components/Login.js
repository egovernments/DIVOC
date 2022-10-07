import * as React from 'react'
import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'

const Login = () => {
    const {keycloak} = useKeycloak();
    const navigate = useNavigate();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.redirectUri = window.location.origin + "/";
            keycloak.login()
        }
    }, [keycloak]);

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = "/";
            navigate(redirectUrl)
        }
    }, [keycloak, navigate]);

    return (
        <div>
            Login
        </div>
    )
};

export default Login