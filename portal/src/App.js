import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Home from './components/Home/Home'
import About from './components/About'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import React, {useEffect} from "react";
import {Header} from "./components/Header";
import {API_URL, CONSTANTS} from "./utils/constants";
import FacilityAdmin from "./components/FacilityAdmin/FacilityAdmin";
import Admin from "./components/Admin/Admin";
import FacilityController from "./components/FacilityController/FacilityController";
import PrintCertificate from "./components/PrintCertificate/PrintCertificate";
import {Analytics} from "./components/Analytics/Anlaytics";
import MapView from "./components/MapView/MapView"
import config from "./config.json"
import {Provider} from "react-redux";
import {store} from "./redux/store";
import {getApplicationConfigFromEtcd} from "./redux/reducers/etcdConfig";
import FacilityInfo from './components/FacilityInfo/FacilityInfo';
import {addFacilityDetails} from "./redux/reducers/facilityReducer";
import {useAxios} from "./utils/useAxios";
import FacilityConfigureSlot from "./components/FacilityConfigureSlot";

export default function App() {
    const {initialized, keycloak} = useKeycloak();
    const axiosInstance = useAxios('');
    useEffect(() => {
        getApplicationConfigFromEtcd(store.dispatch);
    }, []);

    useEffect(() => {
        if (keycloak.authenticated) {
            try {
                axiosInstance.current
                    .get(API_URL.USER_FACILITY_API)
                    .then((res) => {
                        if (res.data.length > 0) {
                            return store.dispatch(addFacilityDetails(res.data[0]))
                        }
                    })
                    .catch((err) => {
                        console.log("Error occurred while fetching facility details");
                        console.log(err)
                    })
            } catch (e) {
                console.log(e)
            }
        }
    }, [keycloak, initialized]);

    if (!initialized) {
        return <div>Loading...</div>
    }


    return (
        <Provider store={store}>
            <div>
                <Router>
                    <Header/>
                    <div className="body-section">
                        <Switch>
                            <Route exact path={config.urlPath + "/"} component={Home}/>
                            <Route exact path={config.urlPath + "/login"} component={Login}/>
                            <Route exact path={config.urlPath + "/analytics/map"} component={MapView}/>
                            <PrivateRoute exact path={config.urlPath + "/dashboard"} component={Dashboard}/>
                            <PrivateRoute exact path={config.urlPath + "/about"} component={About}/>
                            <PrivateRoute exact path={config.urlPath + "/admin"} component={Admin}
                                          role={CONSTANTS.ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/analytics"} component={Analytics}
                                          role={CONSTANTS.MONITORING} clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/facility_admin"} component={FacilityAdmin}
                                          role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/facility_info"} component={FacilityInfo}
                                          role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/facility_configure_slot"} component={FacilityConfigureSlot}
                                          role={CONSTANTS.FACILITY_ADMIN_ROLE} clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/facility_controller"}
                                          component={FacilityController} role={CONSTANTS.ROLE_CONTROLLER}
                                          clientId={CONSTANTS.PORTAL_CLIENT}/>
                            <PrivateRoute exact path={config.urlPath + "/facility"} component={PrintCertificate}
                                          role={CONSTANTS.FACILITY_PRINT_STAFF} clientId={CONSTANTS.PORTAL_CLIENT}/>
                        </Switch>
                    </div>
                </Router>
            </div>
        </Provider>
    );
}
