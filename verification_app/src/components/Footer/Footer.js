import React from "react";
import Navbar from "react-bootstrap/Navbar";
import styles from "./Footer.module.css";
import Nav from "react-bootstrap/Nav";

function Footer(){
    return(
        <Navbar  bg="white" className="navbar-expand-lg" className={styles['navbar']}>
            <Navbar.Brand>


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
