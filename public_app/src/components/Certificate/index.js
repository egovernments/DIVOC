import React from "react";
import moh from "../../assets/img/moh.png";
import "./index.css";
import * as PropTypes from "prop-types";

export const Certificate = ({qrCode, vaccination, certificateId, issuedDate, name, gender, identityType, identityNumber, age, vaccinationCenter, vaccinationValidUntil, dateOfVaccination}) => (
    <div id={"certificate"} className={"certificate-container"}>
        <table className={"certificate"}>
            <tbody>
            <tr>
                <td valign={"top"}><img src={moh} className={"logo"}/></td>
                {/*<td align={"right"}><img src={qrcode}></img></td>*/}
                <td align={"right"}>
                    {
                        qrCode
                    }
                </td>
            </tr>
            <tr>
                <td colSpan={2}><h5>{vaccination} Vaccination
                    Certificate</h5></td>
            </tr>
            <tr>
                <td><b>Certificate ID:</b> <b>{certificateId}</b></td>
                <td><b>Issue Date:</b> <b>{issuedDate}</b>
                </td>
            </tr>
            <tr>
                <td colSpan={2} className={"top-pad"}><b>Recipient's details:</b></td>
            </tr>
            <tr>
                <td><b className={"b500"}>Name:</b>
                    <span>{name}</span></td>
                <td><b className={"b500"}>Gender:</b>
                    <span>{gender}</span></td>
            </tr>
            <tr>
                <td><b className={"b500"}>{identityType}:</b>
                    <span>{identityNumber}</span></td>
                <td><b
                    className={"b500"}>Age:</b><span> {age}</span>
                </td>
            </tr>
            <tr>
                <td colSpan={2} className={"top-pad"}><b>Centre of Vaccination:</b></td>
            </tr>
            <tr>
                <td colSpan={2}>{vaccinationCenter}</td>
            </tr>
            <tr>
                <td><b>Date of Vaccination</b></td>
                <td><b>Valid Until:</b></td>
            </tr>
            <tr>
                <td><span>{dateOfVaccination}</span></td>
                <td><span>{vaccinationValidUntil}</span></td>
            </tr>
            <tr>
                <td className={"spacer-height"}><span>&nbsp;<br/>&nbsp;</span></td>
                <td><span/></td>
            </tr>
            <tr>
                <td><b>Facility Seal</b></td>
                <td><b>Vaccinator Signature</b></td>
            </tr>
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
