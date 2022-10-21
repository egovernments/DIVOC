import Navbar from "react-bootstrap/Navbar";
import NavbarLogo from "../../assets/img/nav-logo.png";
import "./Header.css";
import Nav from "react-bootstrap/Nav";
import { useTranslation } from "react-i18next";
import { NavDropdown } from "react-bootstrap";
import UserLogo from "../../assets/img/user-logo.png";

function Header() {
  const { i18n } = useTranslation();
  const lngs = {
    en: { nativeName: "English" },
    hi: { nativeName: "Hindi" },
  };


  return (
    <Navbar fixed="top" bg="white">
      <Navbar.Brand href={"/"}>
        <img
          src={NavbarLogo}
          width="100%"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />

      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="">{<Nav.Link href="#">Council Software</Nav.Link>}</Nav>
        <NavDropdown
          title={lngs[i18n.language]?.nativeName || "English"}
          id="basic-nav-dropdown"
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
        <img src={UserLogo} width="7%" height="7%" alt="React Bootstrap logo" />
       
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
