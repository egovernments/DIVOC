import * as React from 'react'
import {Navigate, Route} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'
import { Routes } from 'react-router-dom';
import config from "../config.json";

export function PrivateRoute({children, role, clientId, ...rest}) {
    const {keycloak} = useKeycloak();
        
        const isLoggedIn = keycloak.authenticated;

        return isLoggedIn ?  children: <Navigate to= {config.urlPath + "/login"} />;

        //  <Route
        //     {...rest}
        //     render={(props) =>
        //         keycloak.authenticated ? (
        //             role === undefined || keycloak.hasResourceRole(role, clientId) ?
        //                 <Component {...props} /> : <Navigate to="/"/>
        //         ) : (
        //             <Navigate
        //                 to={{
        //                     pathname: 'login',
        //                     state: {from: props.location},
        //                 }}
        //             />
        //         )
        //     }
        //   />
      
    
}
