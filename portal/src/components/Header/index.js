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
import {NavLink} from "react-router-dom";

export const Header = (props) => {
    const {keycloak} = useKeycloak();
    const logo = useSelector(state => state.flagr.appConfig.applicationLogo);
    const facility = useSelector(state => state.facility);
    const isFacilityUser = () => {
        return keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT) ||
            keycloak.hasResourceRole(CONSTANTS.FACILITY_PRINT_STAFF, CONSTANTS.PORTAL_CLIENT)
    };

    function getFacilityAddress() {
        if ("address" in facility && facility.address) {
            return [facility.address.district.trim(), facility.address.state.trim()].filter(s => s !== "").join(", ");
        } else {
            return ""
        }
    }

    return (
        <Navbar fixed="top" bg="white">
            <Navbar.Brand>
                <img
                    src={logo ? logo : NavbarLogo}
                    height="28"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="align-items-center">
                    {
                        isFacilityUser() && facility && <div className="d-flex align-items-center" style={{fontSize: "14px"}}>
                            <img src={ProfileImg}/>
                            <div className="d-flex flex-column ml-2 mr-2">
                                <b>{facility.facilityName}</b>
                                <span>{getFacilityAddress()}</span>
                            </div>
                        </div>
                    }
                    {
                        isFacilityUser() && facility && <NavLink to={"/portal/facility_info"} >PROFILE</NavLink>
                    }
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
