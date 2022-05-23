import * as React from 'react'
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'
import {CONSTANTS} from "../utils/constants";
import config from "../config.json"

const Login = () => {
    const {keycloak} = useKeycloak();
    const history = useHistory();

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.login()
        }
    }, []);

    const pathOf = (fragment) => {
        return config.urlPath + fragment;
    }

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = pathOf("/");
            if (keycloak.hasResourceRole(CONSTANTS.ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = pathOf("/admin")
            } else if (keycloak.hasResourceRole(CONSTANTS.MONITORING, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = pathOf("/analytics")
            } else if (keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = pathOf("/facility_admin")
            } else if (keycloak.hasResourceRole(CONSTANTS.ROLE_CONTROLLER, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = pathOf("/facility_controller")
            } else if (keycloak.hasResourceRole(CONSTANTS.FACILITY_PRINT_STAFF, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = pathOf("/facility")
            } else {
                alert("Unauthorized access. Contact ADMIN");
                keycloak.logout({redirectUri: window.location.origin + config.urlPath});
                return
            }
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
