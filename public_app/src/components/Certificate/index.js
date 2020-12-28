import React from "react";
import logo from "../../assets/img/logo.svg";
import "./index.css";
import PropTypes from 'prop-types';
import programLogo from "../../assets/img/program_logo.png"
import phone from "../../assets/img/phone.svg"
import globe from "../../assets/img/globe.svg"
import {labelConfig} from "../CertificateView/labelConfig";


export const Certificate = ({
                                qrCode,
                                vaccination,
                                manufacturer,
                                certificateId,
                                issuedDate,
                                name,
                                gender,
                                identityType,
                                identityNumber,
                                age,
                                vaccinationCenter,
                                vaccinationValidUntil,
                                dateOfVaccination,
                                infoUrl
                            }) => (
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
                    <h4><b>{labelConfig.title.en}</b></h4>
                    <h5>{labelConfig.title.alt}</h5>
                    <br/>
                </td>
            </tr>
            <tr>
                <td><b>{labelConfig.certificateId.en} / {labelConfig.certificateId.alt}</b></td>
                <td><span>{certificateId}</span></td>
            </tr>
            <tr>
                <td><b>{labelConfig.issueDate.en} / {labelConfig.issueDate.alt}</b></td>
                <td><span>{issuedDate}</span></td>
            </tr>
            {/*<tr>*/}
            {/*    <td colSpan={2}><b>Vaccination:</b> {vaccination}, {manufacturer}</td>*/}
            {/*</tr>*/}
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td colSpan={2} className={"top-pad"}>
                    <b>{labelConfig.recipientDetails.en} / {labelConfig.recipientDetails.alt}</b></td>
            </tr>
            <tr>
                <td><b className={"b500"}>{labelConfig.name.en} / {labelConfig.name.alt}</b>
                </td>
                <td>
                    <span> {name}</span>
                </td>
            </tr>
            <tr>
                <td><b className={"b500"}>{labelConfig.idDetails.en} {labelConfig.idDetails.alt}</b>
                </td>
                <td>
                    <span> {identityType} # {identityNumber}</span>
                </td>
            </tr>
            <tr>
                <td><b className={"b500"}>{labelConfig.gender.en} / {labelConfig.gender.alt}</b>
                </td>
                <td>
                    <span> {gender}</span>
                </td>
            </tr>

            <tr>
                <td><b
                    className={"b500"}>{labelConfig.age.en} / {labelConfig.age.alt}</b></td>
                <td><span> {age}</span>
                </td>
            </tr>

            <tr>
                <td className={"top-pad"}><b>{labelConfig.vaccinationCenter.en}
                    <br/>/ {labelConfig.vaccinationCenter.alt}</b></td>
                <td>{vaccinationCenter}</td>
            </tr>
            <tr>
                <td>
                    <b>{labelConfig.vaccineManufacturer.en} <br/>
                        / {labelConfig.vaccineManufacturer.alt}</b>
                </td>
                <td>{vaccination} {manufacturer}</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>
                    <b>{labelConfig.dateOfVaccination.en} / {labelConfig.dateOfVaccination.alt}</b></td>
                <td><span>{dateOfVaccination}</span></td>

            </tr>
            <tr>
                <td><b>{labelConfig.vaccineDose.en} / {labelConfig.vaccineDose.alt} </b></td>
                <td>1 of 2</td>
            </tr>
            <tr>
                <td><b>{labelConfig.validUntil.en} / {labelConfig.validUntil.alt}</b></td>
                <td><span>{vaccinationValidUntil}</span></td>
            </tr>
            <tr>
                <td colSpan={2}>
                    <hr/>
                </td>
            </tr>
            <tr>
                <td colSpan={2}>
                    <div className={"row"}>
                        <span className={"col-1"}><img src={programLogo} className={"program-logo"}></img> </span>
                        <span className={"col-5"}>
              <b>{labelConfig.slogan.en}</b>
              <br/>
              <b>{labelConfig.slogan.alt}</b>
            </span>
                        <div className={"col-6"}>
                            <span className={"small"}>{labelConfig.moreInfo.en} / {labelConfig.moreInfo.alt}</span><br/>
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
