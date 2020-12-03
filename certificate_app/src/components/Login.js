import * as React from 'react'
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import config from "../config"
import {useKeycloak} from '@react-keycloak/web'

const Login = () => {
    const {keycloak} = useKeycloak();
    const history = useHistory();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.login()
        }
    }, []);

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = config.urlPath;
            history.push(redirectUrl)
        }
    }, [keycloak]);

    return (
        <div>
            Login
        </div>
    )
};

export default Login