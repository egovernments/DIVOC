import React from "react";
import logo from "../../assets/img/logo.svg";
import "./index.css";
import PropTypes from 'prop-types';
import programLogo from "../../assets/img/program_logo.png"
import phone from "../../assets/img/phone.svg"
import globe from "../../assets/img/globe.svg"


export const Certificate = ({qrCode, vaccination, manufacturer, certificateId, issuedDate, name, gender, identityType, identityNumber, age, vaccinationCenter, vaccinationValidUntil, dateOfVaccination, infoUrl}) => (
  <div id={"certificate"} className={"certificate-container"}>
    <table className={"certificate"}>
      <tbody>
      <tr>
        <td valign={"top"}><img src={logo} className={"logo"}/></td>
        {/*<td align={"right"}><img src={qrcode}></img></td>*/}
        <td align={"right"}>
          {
            qrCode
          }
        </td>
      </tr>
      <tr>
        <td colSpan={2}>
            <h4><b>Vaccination Certificate</b></h4>
           <h5>टीकाकरण प्रमाण पत्र</h5>
            <br/>
        </td>
      </tr>
      <tr>
        <td><b>Certificate ID / प्रमाणपत्र क्रमांक</b></td>
        <td><span>{certificateId}</span></td>
      </tr>
      <tr>
        <td><b>Issue Date / जारी करने की तिथि</b></td>
        <td><span>{issuedDate}</span></td>
      </tr>
      {/*<tr>*/}
      {/*    <td colSpan={2}><b>Vaccination:</b> {vaccination}, {manufacturer}</td>*/}
      {/*</tr>*/}
      <tr>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td colSpan={2} className={"top-pad"}><b>Recipient’s details / प्राप्तकर्ता का विवरण</b></td>
      </tr>
      <tr>
        <td><b className={"b500"}>Name / नाम</b>
        </td>
        <td>
          <span> {name}</span>
        </td>
      </tr>
      <tr>
        <td><b className={"b500"}>ID Details आईडी विवरण</b>
        </td>
        <td>
          <span> {identityType} # {identityNumber}</span>
        </td>
      </tr>
      <tr>
        <td><b className={"b500"}>Gender / लिंग</b>
        </td>
        <td>
          <span> {gender}</span>
        </td>
      </tr>

      <tr>
        <td><b
          className={"b500"}>Age / उम्र</b></td>
        <td><span> {age}</span>
        </td>
      </tr>

      <tr>
        <td className={"top-pad"}><b>Centre of Vaccination <br/>/ टीकाकरण केंद्र</b></td>
        <td>{vaccinationCenter}</td>
      </tr>
      <tr>
          <td>
              <b>Vaccine and Manufacturer <br/>
                  / टीका और निर्माता</b>
          </td>
          <td>{vaccination} {manufacturer}</td>
      </tr>
      <tr>
        <td><b>Date of Vaccination /  टीकाकरण की तिथि</b></td>
          <td><span>{dateOfVaccination}</span></td>

      </tr>
      <tr>
          <td><b>Vaccine Dose / टीके की खुराक </b></td>
          <td>1 of 2</td>
      </tr>
      <tr>
          <td><b>Valid Until / वैधता</b></td>
        <td><span>{vaccinationValidUntil}</span></td>
      </tr>
      <tr><td colSpan={2}><hr/></td></tr>
      <tr>
        <td colSpan={2}>
            <div className={"row"}>
            <span className={"col-1"}><img src={programLogo} className={"program-logo"}></img> </span>
            <span className={"col-5"}>
              <b>Carona Harega India Jeetega</b>
              <br/>
              <b>करोना हारेगा इंडिया जीतेगा</b>
            </span>
        <div className={"col-6"}>
            <span className={"small"}>For more information / अधिक जानकारी के लिए</span><br/>
            <img src={globe}></img> <b> {"https://divoc.xiv.in/learn"}</b>
            <br/>
            <img src={phone}></img> <b> 1800 000 000</b>
        </div>
            </div>
        </td>
      </tr>
      {/*<tr>*/}
      {/*    <td className={"spacer-height"}><span>&nbsp;<br/>&nbsp;</span></td>*/}
      {/*    <td><span/></td>*/}
      {/*</tr>*/}
      {/*<tr>*/}
      {/*    <td><b>Facility Seal</b></td>*/}
      {/*    <td><b>Vaccinator Signature</b></td>*/}
      {/*</tr>*/}
      {/*<tr>*/}
      {/*    <td colSpan={2}><img src={footer} className={"footer"]}></img></td>*/}
      {/*</tr>*/}
      </tbody>
    </table>
  </div>
);

Certificate.propTypes = {
  qrCode: PropTypes.element,
  vaccination: PropTypes.string,
  certificateId: PropTypes.string,
  issuedDate: PropTypes.string,
  name: PropTypes.string,
  gender: PropTypes.string,
  identityType: PropTypes.string,
  identityNumber: PropTypes.string,
  age: PropTypes.string,
  vaccinationCenter: PropTypes.string,
  vaccinationValidUntil: PropTypes.string,
  dateOfVaccination: PropTypes.string

};
