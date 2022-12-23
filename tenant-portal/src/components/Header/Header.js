import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./Header.css";
import { useKeycloak } from "@react-keycloak/web";
import Nav from "react-bootstrap/Nav";
import { useTranslation } from "react-i18next";
import UserLogo from "../../assets/img/profile.svg";
import { useState, useEffect } from "react";
import config from '../../config.json'
import DropdownComponent from "../DropdownComponent/DropdownComponent";
function Header() {
  const {keycloak} = useKeycloak();
  const [profileName, setProfileName] = useState("");
  const { i18n } = useTranslation();
  const languagesObj = {
    en : "English",
    hi : "Hindi"
  };
  const profileObj = {
    cp: "Change Password",
    lo: "LogOut"
  }
  
  const changeLanguageFunc = (lng) => {
    return i18n.changeLanguage(lng);
  };
  const profileFunc = (request) => {
    if(request=="cp") {
      keycloak.login({action: "UPDATE_PASSWORD"});
      return
    } else if(request=="lo") {
      keycloak.logout();
      return
    }
  }
  useEffect(() => {
    var profileName = keycloak?.idTokenParsed?.preferred_username.split("@")[0];
    profileName = profileName?.charAt(0).toUpperCase()+ profileName?.slice(1);
    setProfileName(profileName);
  }, []);
  
  return (
    <Navbar fixed="top" bg="white" className="px-3 py-2">
      <Navbar.Brand href={`${config.urlPath}/`}>
        <img
          src={NavbarLogo}
          width="90%"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>{<Nav.Link href="#">{profileName}</Nav.Link>}</Nav>
        <DropdownComponent
          options={languagesObj}
          handleChange={changeLanguageFunc}
          variant = "outline-light"
          align = 'end'
          title={languagesObj[i18n.language] || "English"} 
        />
        <DropdownComponent className="profile"
          options={profileObj}
          handleChange={profileFunc}
          variant = "outline-light"
          align = 'end'
          title={<img src={UserLogo} />} 
        />
      </Navbar.Collapse>
    </Navbar>
  );
}
export default Header;