import * as React from 'react'
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'

const Login = () => {
    const {keycloak} = useKeycloak();
    const history = useHistory();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.redirectUri = window.location.origin + "/";
            keycloak.login()
        }
    }, [keycloak]);

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = "/";
            history.push(redirectUrl)
        }
    }, [keycloak, history]);

    return (
        <div>
            Login
        </div>
    )
};

export default Login