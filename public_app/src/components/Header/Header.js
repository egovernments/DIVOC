import React from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./Header.css";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {useKeycloak} from "@react-keycloak/web";
import config from "../../config"

function Header() {
    const {initialized, keycloak} = useKeycloak();
    return(
        <Navbar fixed="top" bg="white">
            <Navbar.Brand href={"/"}>
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
                    {/*<Nav.Link href="/">HOME</Nav.Link>*/}
                    {/*<NavDropdown title="ENG" id="basic-nav-dropdown">*/}
                    {/*    <NavDropdown.Item href="#action/3.1">ENG</NavDropdown.Item>*/}
                    {/*</NavDropdown>*/}
                    {keycloak.authenticated && <Nav.Link onClick={() => {keycloak.logout({redirectUri: window.location.origin});}}>LOGOUT</Nav.Link>}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;