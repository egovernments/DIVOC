import React, {useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./index.css";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {useKeycloak} from "@react-keycloak/web";
import {CONSTANTS} from "../../utils/constants";
import config from "../../config";
import {useSelector} from "react-redux";

export const Header = (props) => {
    const {keycloak} = useKeycloak();
    const logo = useSelector(state => state.flagr.appConfig.applicationLogo);

    return (
        <Navbar fixed="top" bg="white">
            <Navbar.Brand href="/">
                <img
                    src={logo ? logo : NavbarLogo}
                    height="28"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="">
                    {/*{!keycloak.authenticated && <Nav.Link href="#home">MAP</Nav.Link>}*/}
                    {/*<Nav.Link href="https://divoc.xiv.in" target="_blank">PUBLIC PORTAL</Nav.Link>*/}
                    {keycloak.authenticated && keycloak.hasResourceRole(CONSTANTS.MONITORING, CONSTANTS.PORTAL_CLIENT) &&
                    < Nav.Link href="/analytics">ANALYTICS</Nav.Link>}
                    {keycloak.authenticated && <Nav.Link onClick={() => {
                        keycloak.logout({redirectUri: window.location.origin + config.urlPath});
                    }}>LOGOUT</Nav.Link>}
                    {/*{!keycloak.authenticated &&*/}
                    {/*<NavDropdown title="ENG" id="basic-nav-dropdown">*/}
                    {/*    <NavDropdown.Item href="#action/3.1">ENG</NavDropdown.Item>*/}
                    {/*</NavDropdown>}*/}

                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
