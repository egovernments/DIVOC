import './App.css';
import logo from './logo.svg';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import Home from './components/Home'
import About from './components/About'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import React from "react";
import Admin from '../src/components/Admin/Admin';

export default function App() {
  const {initialized, keycloak} = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>
  }
  const checkIFRoleIsAdmin = keycloak.hasResourceRole('admin', 'vaccination_api');

  return (
    <div>
      <div><img src={logo}></img></div>
      <Router>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/about">What is DIVOC?</Link></li>
            {checkIFRoleIsAdmin ? <li><Link to="/admin">Admin</Link></li> : ''}
            <li><button onClick={() => {keycloak.logout()}}>LOGOUT</button></li>
          </ul>

          <hr/>

          {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
          <Switch>
            <PrivateRoute exact path="/" component={Home}/>
            <Route exact path="/login" component={Login}/>
            <PrivateRoute exact path="/dashboard" component={Dashboard}/>
            <PrivateRoute exact path="/about" component={About}/>
            {checkIFRoleIsAdmin ? <PrivateRoute exact path="/admin" component={Admin}/> : ''}
          </Switch>
        </div>
      </Router>
    </div>
  );
}