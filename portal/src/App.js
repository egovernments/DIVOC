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
import MapView from "./components/MapView/MapView"
import config from "./config"
import FacilityInfo from './components/FacilityInfo/FacilityInfo';


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
                        <Route exact path={config.urlPath + "/"}  component={Home}/>
                        <Route exact path={config.urlPath + "/login"} component={Login}/>
                        <Route exact path={config.urlPath + "/analytics/map"} component={MapView}/>
                        <PrivateRoute exact path={config.urlPath + "/dashboard"} component={Dashboard}/>
                        <PrivateRoute exact path={config.urlPath + "/about"} component={About}/>
                        <PrivateRoute exact path={config.urlPath + "/admin"} component={Admin} role={CONSTANTS.ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path={config.urlPath + "/analytics"} component={Analytics} role={CONSTANTS.MONITORING} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path={config.urlPath + "/facility_admin"} component={FacilityAdmin} role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path={config.urlPath + "/facility_info"} component={FacilityInfo} role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path={config.urlPath + "/facility_controller"} component={FacilityController} role={CONSTANTS.ROLE_CONTROLLER} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        <PrivateRoute exact path={config.urlPath + "/facility"} component={PrintCertificate} role={CONSTANTS.FACILITY_PRINT_STAFF} clientId={CONSTANTS.PORTAL_CLIENT}/>
                    </Switch>
                </div>
            </Router>
        </div>
    );
}
