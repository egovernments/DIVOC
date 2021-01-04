import * as React from 'react'
import {useEffect} from 'react'
import {Redirect, Route} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'
import {CONSTANT} from "./constants";
import config from "../config"


export function PrivateRoute({component: Component, ...rest}) {
    const {keycloak} = useKeycloak();
    useEffect(() => {
        if (keycloak.authenticated) {
            if (!keycloak.hasResourceRole(CONSTANT.FACILITY_STAFF_ROLE, CONSTANT.PORTAL_CLIENT)) {
                alert("Unauthorized. Contact ADMIN");
                // keycloak.logout({redirectUri: window.location.origin + "/"});
                keycloak.logout();
            }
        }
    }, [keycloak]);
    return (
        <Route
            {...rest}
            render={(props) =>
                keycloak.authenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: config.urlPath + '/login',
                        }}
                    />
                )
            }
        />
    )
}
