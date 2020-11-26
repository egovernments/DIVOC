import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Home from './components/Home/Home'
import About from './components/About'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import React from "react";
import Admin from '../src/components/Admin/Admin';
import {Header} from "./components/Header";

export default function App() {
    const {initialized} = useKeycloak();
    if (!initialized) {
        return <div>Loading...</div>
    }
    return (
        <div>
            <Router>
                <Header/>
                <div className="body-section">
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/login" component={Login}/>
                        <PrivateRoute exact path="/dashboard" component={Dashboard}/>
                        <PrivateRoute exact path="/about" component={About}/>
                        <PrivateRoute exact path="/admin" component={Admin}/>
                    </Switch>
                </div>
            </Router>
        </div>
    );
}