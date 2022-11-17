import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./Header.css";
import { useKeycloak } from "@react-keycloak/web";
import Nav from "react-bootstrap/Nav";
import { useTranslation } from "react-i18next";
import { Dropdown, NavDropdown } from "react-bootstrap";
import UserLogo from "../../assets/img/user-logo.png";
import { useState, useEffect } from "react";

function Header() {
  const {keycloak} = useKeycloak();
  const [showProfile, setShowProfile] = useState(false);
  const { i18n } = useTranslation();
  const lngs = {
    en: { nativeName: "English" },
    hi: { nativeName: "Hindi" },
  };
  const toggleProfile = (event) => {
    event.stopPropagation();
    setShowProfile(!showProfile)
  }
  const handleClick = () => {
    setShowProfile(false);
  };
  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);
  
  function logout(){
    keycloak.logout();
    return 
  }
  return (
    <Navbar fixed="top" bg="white" className="px-3 py-2">
      <Navbar.Brand href={"/tenant-portal"}>
        <img
          src={NavbarLogo}
          width="90%"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />

      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="">{<Nav.Link href="#">Council Software</Nav.Link>}</Nav>
        <NavDropdown
          title={lngs[i18n.language]?.nativeName || "English"}
          id="basic-nav-dropdown"
          align="end"
        >
          {Object.keys(lngs).map((lng) => (
            <NavDropdown.Item
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
            >
              {lngs[lng].nativeName}
            </NavDropdown.Item>
          ))}
        </NavDropdown>
        <Dropdown title={<img src={UserLogo} />} >
          <Dropdown.Menu>
            <Dropdown.Item>bhanu</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div style={{cursor:"pointer",}}>
          <img src={UserLogo} className="header-profile " onClick={toggleProfile} />
          <ul className={(showProfile) ? "profile-dropdown": "d-none" }>
            <li><span>Change Password</span></li>
            <li onClick={logout} href="#"><span>Logout</span></li>
          </ul>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
