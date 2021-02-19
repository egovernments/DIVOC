import React, { useEffect, useState } from "react";
import logo from "../../assets/img/logo.svg";
import "./index.css";
import PropTypes from "prop-types";
import programLogo from "../../assets/img/program_logo.png";
import phone from "../../assets/img/phone.svg";
import globe from "../../assets/img/globe.svg";
import { getCertificateLabels } from "../../utils/config";

export const FinalCertificate = function ({
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
    infoUrl,
    dose,
    totalDoses,
}) {
    const [labelConfig, setLabelConfig] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getCertificateLabels()
            .then((result) => {
                setError(null);
                setLabelConfig(result);
            })
            .catch((e) => setError(e));
    }, []);
    if (!labelConfig) {
        return <div>Loading..</div>;
    }
    if (error) {
        return <div>Failed to load certificate. Please try again</div>;
    }
    return (
        <div
            id={"certificate"}
            className={"certificate-container table-responsive"}
        >
            <div className="row">
                <div valign={"top"} className="col-lg-6 col-sm-6">
                    <img src={logo} className={"logo"} />
                </div>
                <div className="col-lg-6 col-sm-12 d-flex justify-content-center">
                    {qrCode}
                </div>
            </div>
            <table className={"certificate table table-borderless"}>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <h4>
                                <b>{labelConfig.title.en}</b>
                            </h4>
                            <h5>{labelConfig.title.alt}</h5>
                            <br />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.certificateId.en} /{" "}
                                {labelConfig.certificateId.alt}
                            </b>
                        </td>
                        <td>
                            <span>{certificateId}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.issueDate.en} /{" "}
                                {labelConfig.issueDate.alt}
                            </b>
                        </td>
                        <td>
                            <span>{issuedDate}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className={"top-pad"}>
                            <b>
                                {labelConfig.recipientDetails.en} /{" "}
                                {labelConfig.recipientDetails.alt}
                            </b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b className={"b500"}>
                                {labelConfig.name.en} / {labelConfig.name.alt}
                            </b>
                        </td>
                        <td>
                            <span> {name}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b className={"b500"}>
                                {labelConfig.idDetails.en}{" "}
                                {labelConfig.idDetails.alt}
                            </b>
                        </td>
                        <td>
                            <span>
                                {" "}
                                {identityType} # {identityNumber}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b className={"b500"}>
                                {labelConfig.gender.en} /{" "}
                                {labelConfig.gender.alt}
                            </b>
                        </td>
                        <td>
                            <span> {gender}</span>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <b className={"b500"}>
                                {labelConfig.age.en} / {labelConfig.age.alt}
                            </b>
                        </td>
                        <td>
                            <span> {age}</span>
                        </td>
                    </tr>

                    <tr>
                        <td className={"top-pad"}>
                            <b>
                                {labelConfig.vaccinationCenter.en}
                                <br />/ {labelConfig.vaccinationCenter.alt}
                            </b>
                        </td>
                        <td>{vaccinationCenter}</td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.vaccineManufacturer.en} <br />/{" "}
                                {labelConfig.vaccineManufacturer.alt}
                            </b>
                        </td>
                        <td>
                            {vaccination} {manufacturer}
                        </td>
                    </tr>
                    <tr>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.dateOfVaccination.en} <br />/{" "}
                                {labelConfig.dateOfVaccination.alt}
                            </b>
                        </td>
                        <td>
                            <span>{dateOfVaccination}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.vaccineDose.en} /{" "}
                                {labelConfig.vaccineDose.alt}{" "}
                            </b>
                        </td>
                        <td>{dose} of {totalDoses}</td>
                    </tr>
                    <tr>
                        <td>
                            <b>
                                {labelConfig.validUntil.en} /{" "}
                                {labelConfig.validUntil.alt}
                            </b>
                        </td>
                        <td>
                            <span>{vaccinationValidUntil}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <hr />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className={"row"}>
                                <span className={"col-1"}>
                                    <img
                                        src={programLogo}
                                        className={"program-logo"}
                                    ></img>{" "}
                                </span>
                                <span className={"col-5"}>
                                    <b>{labelConfig.slogan.en}</b>
                                    <br />
                                    <b>{labelConfig.slogan.alt}</b>
                                </span>
                                <div className={"col-6"}>
                                    <span className={"small"}>
                                        {labelConfig.moreInfo.en} /{" "}
                                        {labelConfig.moreInfo.alt}
                                    </span>
                                    <br />
                                    <img src={globe}></img>{" "}
                                    <b> {"https://divoc.togosafe.gouv.tg/learn"}</b>
                                    <br />
                                    <img src={phone}></img> <b> 1800 000 000</b>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

FinalCertificate.propTypes = {
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
    dateOfVaccination: PropTypes.string,
    dose: PropTypes.string,
    totalDoses: PropTypes.string,
};
