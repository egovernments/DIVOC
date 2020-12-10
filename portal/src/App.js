import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Home from './components/Home/Home'
import About from './components/About'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import React from "react";
import {Header} from "./components/Header";
import {CONSTANTS} from "./utils/constants";
import FacilityAdmin from "./components/FacilityAdmin/FacilityAdmin";
import Admin from "./components/Admin/Admin";
import FacilityController from "./components/FacilityController/FacilityController";
import PrintCertificate from "./components/PrintCertificate/PrintCertificate";
import {Analytics} from "./components/Analytics/Anlaytics";


export default function App() {
    const {initialized, keycloak} = useKeycloak();
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
                        <PrivateRoute exact path="/admin" component={Admin} role={CONSTANTS.ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path="/analytics" component={Analytics} role={CONSTANTS.MONITORING} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path="/facility_admin" component={FacilityAdmin} role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path="/facility_controller" component={FacilityController} role={CONSTANTS.ROLE_CONTROLLER} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path="/facility" component={PrintCertificate} role={CONSTANTS.FACILITY_PRINT_STAFF} clientId={CONSTANTS.PORTAL_CLIENT}/>
                    </Switch>
                </div>
            </Router>
        </div>
    );
}
