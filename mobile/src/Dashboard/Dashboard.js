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

Dashboard.propTypes = {};

function Dashboard(props) {
    const {selectedKey, setSelectedKey} = useState("home")
    return (
        <div className={"dashboard-container"}>
            <div className={"host-container"}>
                <Router>
                    <Switch>
                        <Route path="/" exact component={Home}/>
                        <Route path="/language" exact component={SelectLanguage}/>
                        <Route path="/queue" exact component={Queue}/>
                        <Route path="/logout" exact component={Logout}/>
                    </Switch>
                </Router>
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
    );
}

export default Dashboard;
