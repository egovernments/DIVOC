import React, {useEffect} from "react";
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
