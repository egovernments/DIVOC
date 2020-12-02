import React from 'react';
import './Dashboard.scss'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {BottomItem} from "../Base/Base";
import home from '../Home/home.svg'
import language from '../Language/language.svg'
import queue from '../Queue/queue.svg'
import logout from '../Logout/logout.svg'
import help from '../assets/img/help.svg'
import {Home} from "../Home/Home";
import {Queue} from "../Queue/Queue";
import {SelectLanguage} from "../Language/Language";
import {Logout} from "../Logout/Logout";
import {PrivateRoute} from "../utils/PrivateRoute";
import {LoginComponent} from "../Login/Login";
import {PreEnrollmentFlow} from "../Home/Forms/PreEnrollmentFlow";
import {ConfirmFlow} from "../ConfirmVaccination";
import {useLocation} from "react-router";

Dashboard.propTypes = {};

function Dashboard(props) {
    return (
        <Router>
            <div className={"dashboard-container"}>
                <div className={"host-container"}>

                    <Switch>
                        <PrivateRoute path="/" exact component={Home}/>
                        <PrivateRoute path="/language" exact component={SelectLanguage}/>
                        <PrivateRoute path="/queue" exact component={Queue}/>
                        <PrivateRoute path="/logout" exact component={Logout}/>
                        <PrivateRoute path="/preEnroll/:pageName" component={PreEnrollmentFlow}/>
                        <PrivateRoute path="/confirm/vaccination/:recipient_id/:pageName" component={ConfirmFlow}/>
                        <Route path="/login" exact component={LoginComponent}/>
                    </Switch>
                    <Footer/>
                </div>

            </div>
        </Router>
    );
}

export default Dashboard;

const Footer = () => {
    const location = useLocation();
    return (
        <div className="bottom-bar d-flex justify-content-around">
            <BottomItem currentLocation={location.pathname} src={home} href={"/"} title={"Home"}/>
            <BottomItem currentLocation={location.pathname} src={language} href={"/language"} title={"Language"}/>
            <BottomItem currentLocation={location.pathname} src={queue} href={"/queue"} title={"Queue"}/>
            <BottomItem currentLocation={location.pathname} src={help} href={"/logout"} title={"Help"}/>
            <BottomItem currentLocation={location.pathname} src={logout} href={"/logout"} title={"Logout"}/>
        </div>
    )
}