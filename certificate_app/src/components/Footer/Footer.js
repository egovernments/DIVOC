import React from "react";
import Navbar from "react-bootstrap/Navbar";
import styles from "./Footer.module.css";
import Nav from "react-bootstrap/Nav";
import DigitalIndiaLogo from "../../assets/img/digital-India-logo.png";
import NhaLogo from "../../assets/img/nha-logo.png";
import MeitLogo from "../../assets/img/meit-logo.png";

function Footer(){
    return(
        <Navbar fixed="bottom" bg="white" clasName="navbar-expand-lg" className={styles['navbar']}>
            <Navbar.Brand>
                <img
                    src={MeitLogo}
                    width="150"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
                <img
                    src={NhaLogo}
                    width="150"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
                <img
                    src={DigitalIndiaLogo}
                    width="150"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                />
                
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                <Nav className="">
                    <Nav.Link href="#contact">Contact Us</Nav.Link>
                    <Nav.Link href="#terms">Term of use</Nav.Link>
                    <Nav.Link href="#policy">Privacy policy</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Footer;