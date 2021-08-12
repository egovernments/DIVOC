import React, {useEffect, useState} from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./Header.css";
import Nav from "react-bootstrap/Nav";
import {useKeycloak} from "@react-keycloak/web";
import {getUserNumberFromRecipientToken} from "../../utils/reciepientAuth";
import {removeCookie, setCookie} from "../../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../../constants";
import {useTranslation} from "react-i18next";
import {NavDropdown} from "react-bootstrap";

function Header() {
    const {initialized, keycloak} = useKeycloak();
    const [reciepientUser, setReciepientUser] = useState('');
    const { i18n } = useTranslation();

    useEffect(() => {
        const rUser = getUserNumberFromRecipientToken();
        setReciepientUser(rUser);
    }, []);

    const lngs = {
        en: { nativeName: 'English' },
        hi: { nativeName: 'Hindi' }
    };
    
    function logoutRecipient() {
        removeCookie(CITIZEN_TOKEN_COOKIE_NAME);
        window.location.href = "/"
    }

    function onLogoutClicked() {
        if (reciepientUser) {
            logoutRecipient()
        }
        if (keycloak.authenticated) {
            keycloak.logout({redirectUri: window.location.origin})
        }
    }
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
                <NavDropdown title={lngs[i18n.language].nativeName} id="basic-nav-dropdown">
                    {Object.keys(lngs).map((lng) => (
                      <NavDropdown.Item key={lng} onClick={() => i18n.changeLanguage(lng)}>
                          {lngs[lng].nativeName}
                      </NavDropdown.Item>
                    ))}
                </NavDropdown>
                <Nav className="">
                    {/*<Nav.Link href="/">HOME</Nav.Link>*/}
                    {/*<NavDropdown title="ENG" id="basic-nav-dropdown">*/}
                    {/*    <NavDropdown.Item href="#action/3.1">ENG</NavDropdown.Item>*/}
                    {/*</NavDropdown>*/}
                    {(keycloak.authenticated || reciepientUser) && <Nav.Link onClick={onLogoutClicked}>LOGOUT</Nav.Link>}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
