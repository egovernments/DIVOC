import React, {useState} from 'react';
import {useAuthorizedUser} from "../authentication";
import Button from 'react-bootstrap/Button'
import './Dashboard.scss'
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {BaseCard} from "../Base/Base";

Dashboard.propTypes = {};

function Dashboard(props) {
    const {selectedKey, setSelectedKey} = useState("home")
    console.log(selectedKey);
    return (
        <div className={"home-container"}>
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
                     onSelect={(k) => setSelectedKey(k)}
                >
                    <Nav.Item><Nav.Link eventKey={"home"} href="/">Home</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey={"language"} href="/language">Language</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey={"queue"} href="/queue">Queue</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey={"logout"} href="/logout">Logout</Nav.Link></Nav.Item>
                </Nav>
            </div>
        </div>
    );
}

function Queue(props) {
    return (
        <div>Queue</div>
    );
}

function Logout(props) {
    const {logout} = useAuthorizedUser();
    return (
        <Card>
            <Button variant="success" onClick={() => {
                logout();
            }}>Logout</Button>{' '}
        </Card>
    );
}

function Home(props) {
    return (
        <BaseCard>
            <div>Home</div>
        </BaseCard>
    );
}

function SelectLanguage(props) {
    return (
        <div>Select Language</div>
    );
}

export default Dashboard;
