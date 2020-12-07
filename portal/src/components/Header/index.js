import React from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./index.css";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {useKeycloak} from "@react-keycloak/web";

export const Header = (props) => {
    const {keycloak} = useKeycloak();
    return (
        <Navbar fixed="top" bg="white">
            <Navbar.Brand>
                <img
                    src={NavbarLogo}
                    width="200"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="">
                    {!keycloak.authenticated && <Nav.Link href="#home">MAP</Nav.Link>}
                    <Nav.Link href="/">HOME</Nav.Link>
                    {keycloak.authenticated && <Nav.Link onClick={() => {keycloak.logout({redirectUri: window.location.origin + "/"});}}>LOGOUT</Nav.Link>}
                    {!keycloak.authenticated &&
                    <NavDropdown title="ENG" id="basic-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">ENG</NavDropdown.Item>
                    </NavDropdown>}
                    <Nav.Link href="#link">HELP</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}