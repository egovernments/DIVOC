import * as React from 'react'
import {Redirect, Route} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'


export function PrivateRoute({component: Component, role, clientId, ...rest}) {
    const {keycloak} = useKeycloak();
    return (
        <Route
            {...rest}
            render={(props) =>
                keycloak.authenticated ? (
                    role === undefined || keycloak.hasResourceRole(role, clientId) ?
                        <Component {...props} /> : <Redirect to="/"/>
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: {from: props.location},
                        }}
                    />
                )
            }
        />
    )
}
