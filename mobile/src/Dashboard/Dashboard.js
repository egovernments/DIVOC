import React, {useState} from 'react';
import './Dashboard.scss'
import Nav from "react-bootstrap/Nav";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {BottomItem} from "../Base/Base";
import home from '../Home/home.png'
import language from '../Language/language.png'
import queue from '../Queue/queue.png'
import logout from '../Logout/logout.png'
import {Home} from "../Home/Home";
import {Queue} from "../Queue/Queue";
import {SelectLanguage} from "../Language/Language";
import {Logout} from "../Logout/Logout";
import {PrivateRoute} from "../utils/PrivateRoute";
import {LoginComponent} from "../Login/Login";

Dashboard.propTypes = {};

function Dashboard(props) {
    const {selectedKey, setSelectedKey} = useState("home")
    return (
        <Router>
            <div className={"dashboard-container"}>
                <div className={"host-container"}>

                    <Switch>
                        <PrivateRoute path="/" exact component={Home}/>
                        <PrivateRoute path="/language" exact component={SelectLanguage}/>
                        <PrivateRoute path="/queue" exact component={Queue}/>
                        <PrivateRoute path="/logout" exact component={Logout}/>
                        <Route path="/login" exact component={LoginComponent}/>
                    </Switch>

                </div>
                <div className={"bottom-bar"}>
                    <Nav justify variant="tabs" defaultActiveKey="/"
                         activeKey={selectedKey}
                         onSelect={(k) => setSelectedKey(k)}>
                        <BottomItem src={home} href={"/"} title={"Home"}/>
                        <BottomItem src={language} href={"/language"} title={"Language"}/>
                        <BottomItem src={queue} href={"/queue"} title={"Queue"}/>
                        <BottomItem src={logout} href={"/logout"} title={"Logout"}/>
                    </Nav>
                </div>
            </div>
        </Router>
    );
}

export default Dashboard;
