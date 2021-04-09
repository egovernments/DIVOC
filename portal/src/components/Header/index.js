import React, {useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import ProfileImg from "../../assets/img/profile.png";
import "./index.css";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {useKeycloak} from "@react-keycloak/web";
import {CONSTANTS} from "../../utils/constants";
import config from "../../config";
import {useSelector} from "react-redux";
import {NavLink, useHistory} from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";

export const Header = (props) => {
    const {keycloak} = useKeycloak();
    const history = useHistory();
    const logo = useSelector(state => state.flagr.appConfig.applicationLogo);
    const facility = useSelector(state => state.facility);
    const isFacilityUser = () => {
        return keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT) ||
            keycloak.hasResourceRole(CONSTANTS.FACILITY_PRINT_STAFF, CONSTANTS.PORTAL_CLIENT)
    };
    const userMobileNumber = keycloak.idTokenParsed?.preferred_username;
    const userName = keycloak.idTokenParsed?.full_name;

    function getFacilityAddress() {
        if ("address" in facility && facility.address) {
            return [facility.address.district.trim(), facility.address.state.trim()].filter(s => s !== "").join(", ");
        } else {
            return ""
        }
    }

    function getRoleAsString() {
        if (keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT))
            return "(Facility Admin)"
        if (keycloak.hasResourceRole(CONSTANTS.ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT))
            return "(Admin)"
        if (keycloak.hasResourceRole(CONSTANTS.ROLE_CONTROLLER, CONSTANTS.PORTAL_CLIENT))
            return "(Controller)"
        return ""
    }

    return (
        <Navbar fixed="top" bg="white">
            <Navbar.Brand>
                <img
                    src={logo ? logo : NavbarLogo}
                    height="34"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="align-items-center">
                    {
                        <div className="d-flex align-items-center" style={{fontSize: "14px"}}>
                            <Dropdown title={(userName ? userName : userMobileNumber) + " " + getRoleAsString()} className="d-flex flex-column ml-2 mr-2">
                                <Dropdown.Toggle id="dropdown-split-basic" >
                                    <span>
                                        <p style={{fontWeight:"bold"}}>{userName ? userName : userMobileNumber}</p>
                                        <p style={{fontWeight:"light"}}>{getRoleAsString()}</p>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                { isFacilityUser() && facility &&
                                    <div>
                                        <Dropdown.Item onClick={() => history.push(config.urlPath+"/facility_info")}>
                                            <b style={{fontSize:"small"}}>Facility Profile</b>
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                    </div>
                                }
                                {keycloak.authenticated && keycloak.hasResourceRole(CONSTANTS.MONITORING, CONSTANTS.PORTAL_CLIENT) &&
                                <><Dropdown.Item href="/analytics"><b style={{fontSize:"small"}}>Analytics</b></Dropdown.Item><Dropdown.Divider /></>}
                                {keycloak.authenticated && <Dropdown.Item onClick={() => {
                                    keycloak.logout({redirectUri: window.location.origin + config.urlPath});
                                }}><b style={{fontSize:"small"}}>Logout</b></Dropdown.Item>}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    }
                    {
                        // isFacilityUser() && facility && <NavLink to={"/portal/facility_info"} >PROFILE</NavLink>
                    }
                    {/*{!keycloak.authenticated && <Nav.Link href="#home">MAP</Nav.Link>}*/}
                    {/*<Nav.Link href="https://divoc.xiv.in" target="_blank">PUBLIC PORTAL</Nav.Link>*/}

                    {/*{keycloak.authenticated && keycloak.hasResourceRole(CONSTANTS.MONITORING, CONSTANTS.PORTAL_CLIENT) &&*/}
                    {/*< Nav.Link href="/analytics">ANALYTICS</Nav.Link>}*/}
                    {/*{keycloak.authenticated && <Nav.Link onClick={() => {*/}
                    {/*    keycloak.logout({redirectUri: window.location.origin + config.urlPath});*/}
                    {/*}}>LOGOUT</Nav.Link>}*/}

                    {/*{!keycloak.authenticated &&*/}
                    {/*<NavDropdown title="ENG" id="basic-nav-dropdown">*/}
                    {/*    <NavDropdown.Item href="#action/3.1">ENG</NavDropdown.Item>*/}
                    {/*</NavDropdown>}*/}

                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
