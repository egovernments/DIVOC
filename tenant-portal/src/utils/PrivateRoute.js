import * as React from 'react'
import {Navigate, Route} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'


export function PrivateRoute({component: Component, role, clientId, ...rest}) {
    const {keycloak} = useKeycloak();
    return (
        <Route
            {...rest}
            render={(props) =>
                keycloak.authenticated ? (
                    role === undefined || keycloak.hasResourceRole(role, clientId) ?
                        <Component {...props} /> : <Navigate to="/" replace />
                ) : (
                    <Navigate
                        to="/login" state={{from: props.location}} replace
                    />
                )
            }
        />
    )
}
