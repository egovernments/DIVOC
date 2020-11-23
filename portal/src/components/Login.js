import * as React from 'react'
import {useEffect} from 'react'
import {Redirect, useLocation} from 'react-router-dom'

import {useKeycloak} from '@react-keycloak/web'

const Login = () => {
  const location = useLocation();
  const currentLocationState = location.state || {
    from: {pathname: '/'},
  };
  const {keycloak} = useKeycloak();

  useEffect(() => {
    keycloak.login()
  }, []);

  if (keycloak.authenticated) {
    return <Redirect to={currentLocationState}/>;
  }
  return (
    <div>
      Login
    </div>
  )
};

export default Login