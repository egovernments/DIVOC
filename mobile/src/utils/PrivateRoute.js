import * as React from 'react'
import {useEffect} from 'react'
import {Redirect, Route} from 'react-router-dom'
import {CONSTANT} from "./constants";
import config from "../config"
import {useKeycloak} from "@react-keycloak/web";
import {useOnlineStatus} from "./offlineStatus";


export function PrivateRoute({component: Component, ...rest}) {
    const isOnLine = useOnlineStatus()
    return (
        isOnLine ? <WithKeyCloakRoute component={Component} {...rest}/> :
            <WithoutKeyCloakRoute component={Component} {...rest}/>
    )
}

function WithKeyCloakRoute({component: Component, ...rest}) {
    const {keycloak} = useKeycloak()
    useEffect(() => {
        if (keycloak.authenticated) {
            if (!keycloak.hasResourceRole(CONSTANT.FACILITY_STAFF_ROLE, CONSTANT.PORTAL_CLIENT)) {
                alert("Unauthorized. Contact ADMIN");
                keycloak.logout({redirectUri: window.location.origin + config.urlPath});
            }
        }
    }, [keycloak]);
    return <Route
        {...rest}
        render={(props) => {
            return keycloak.authenticated ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: config.urlPath + '/login',
                    }}
                />
            )
        }
        }
    />
}

function WithoutKeyCloakRoute({component: Component,...rest}) {
    return <Route
        {...rest}
        render={(props) => <Component {...props} />
        }
    />
}
