import * as React from 'react'
import {Redirect, Route} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'


export function PrivateRoute({component: Component, ...rest}) {
  //const {keycloak} = useKeycloak();

  return (
    <Route
      {...rest}
      render={(props) =>
      true ? (
          <Component {...props} />
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
