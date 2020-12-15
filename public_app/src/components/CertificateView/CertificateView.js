import React from "react";
import axios from "axios";
import {useEffect} from "react";
import {useKeycloak} from "@react-keycloak/web";
import {useState} from "react";
import styles from "./CertificateView.module.css";
import moh from '../../assets/img/moh.png'
import QRCode from 'qrcode.react';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import download from 'downloadjs'
import {Dropdown} from "react-bootstrap"
const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

function CertificateView() {
    const {keycloak} = useKeycloak();
    const [certificateList, setCertificateList] = useState([]);
    const [checked, setChecked] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const ref = React.createRef();
    const userMobileNumber = keycloak.idTokenParsed.preferred_username;

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        getCertificate();
    }, []);

    const formatDate = (givenDate) => {
        const dob = new Date(givenDate);
        let day = dob.getDate();
        let monthName = monthNames[dob.getMonth()];
        let year = dob.getFullYear();

        return `${day}/${monthName}/${year}`;
    };

    const getCertificate = async () => {
        const response = await axios
            .get("/divoc/api/v1/certificates/" + userMobileNumber, config)
            .then((res) => {
                return res.data;
            });
        console.log(response);
        setCertificateList(response);
        if (response.length === 1) {
            setCertificateData(response[0]);
        }
    };

    const handleChange = (data) => {
        setCertificateData(data);
    };

    const getListOfCertificateBearers = () => {
        return certificateList.map((data) => {
            return (
                <div className={styles["radio"]}>
                    <input
                        type="radio"
                        id="person"
                        name={data}
                        checked={certificateData && certificateData.certificateId === data.certificateId}
                        onChange={(e) => handleChange(data)}
                    ></input>
                    <span className={styles["radio"]}>{data.name}</span>
                </div>
            );
        });
    };

    const formatIdentity = (id) => {
        try {
            let arr = id.split(":")
            return arr[arr.length - 1];
        } catch (e) {
            return "";
        }
    }

    const showCertificatePreview = (certificateData) => {
        return (
            <>
            <div className={["card", "certificate"]}>

                <div></div>
                <div className={"right"}></div>
            </div>
            <div id={"certificate"} className={styles["certificate-container"]}>
            <table borderless className={styles["certificate"]}>
                <tbody>
                <tr>
                    <td valign={"top"}><img src={moh} className={styles["logo"]}></img></td>
                    {/*<td align={"right"}><img src={qrcode}></img></td>*/}
                    <td align={"right"}> <QRCode size={128} value={JSON.stringify(certificateData.certificate)} /></td>
                </tr>
                <tr>
                <td colSpan={2}><h5>{certificateData.certificate.certificateId} Vaccination Certificate</h5></td>
                </tr>
                <tr>
                    <td><b>Certificate ID:</b> <b>{certificateData.certificateId}</b></td>
                    <td><b>Issue Date:</b> <b>{formatDate(certificateData.certificate.issuanceDate)}</b></td>
                </tr>
                <tr>
                    <td colSpan={2} className={styles["top-pad"]}><b>Recipient's details:</b></td>
                </tr>
                <tr>
                    <td><b className={styles["b500"]}>Name:</b> <span>{certificateData.certificate.credentialSubject.name}</span></td>
                    <td><b className={styles["b500"]}>Gender:</b> <span>{certificateData.certificate.credentialSubject.gender}</span></td>
                </tr>
                <tr>
                    <td><b className={styles["b500"]}>Aadhaar:</b> <span>{formatIdentity(certificateData.certificate.credentialSubject.id)}</span></td>
                    {/*<td><b className={styles["b500"]}>DOB:</b><span> {formatDate(certificateData.certificate.recipient.dob)}</span></td>*/}
                </tr>
                <tr><td colSpan={2} className={styles["top-pad"]}><b>Centre of Vaccination:</b></td></tr>
                <tr><td colSpan={2}>{certificateData.certificate.evidence[0].facility.name}</td></tr>
                <tr>
                    <td><b>Date of Vaccination</b></td>
                    <td><b>Valid Until:</b></td>
                </tr>
                <tr>
                    <td><span>{formatDate(certificateData.certificate.evidence[0].date)}</span></td>
                    <td><span>{formatDate(certificateData.certificate.evidence[0].effectiveUntil)}</span></td>
                </tr>
                <tr>
                    <td className={styles["spacer-height"]}><span>&nbsp;<br/>&nbsp;</span></td>
                    <td><span></span></td>
                </tr>
                <tr>
                    <td><b>Facility Seal</b></td>
                    <td><b>Vaccinator Signature</b></td>
                </tr>
                {/*<tr>*/}
                {/*    <td colSpan={2}><img src={footer} className={styles["footer"]}></img></td>*/}
                {/*</tr>*/}
                </tbody>
            </table>
            </div>
            </>
        );
    };

    const handleClick = () => {
        console.log(certificateData)
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificateData));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + ".id");
        dlAnchorElem.click();
    };

    const downloadAsSvg = () => {
        toSvg(document.getElementById('certificate'))
            .then(function (dataUrl) {
                console.log(dataUrl);
                download(dataUrl, "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") +'.svg');
            });
    }

    const downloadAsImage = () => {
        toPng(document.getElementById('certificate'))
            .then(function (dataUrl) {
                console.log(dataUrl);
                download(dataUrl, "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") +'.png');
            });
    }

    const singleCertificateView = () => {
        if (certificateList.length === 1) {
            // setCertificateData(certificateList[0]);
            return (selectedCertificate(certificateList[0]));
        } else {
            return <></>;
        }
    };


    const selectedCertificate = (certificateData) => {
        return <>
            {showCertificatePreview(certificateData)}
            <div className={styles["top-pad"] +" " + styles["no-print"] + " row"}>
                <div className={"col-6"}>
                {/*<button className={styles["button"]} onClick={handleClick}>*/}
                {/*    Download Certificate <img src={DownloadLogo} alt="download"/>*/}
                {/*</button>*/}
                {/*<button className={styles["button"]} onClick={downloadAsImage}>*/}
                {/*    Download Image <img src={DownloadLogo} alt="download"/>*/}
                {/*</button>*/}
                    <Dropdown className={styles["btn-success"]}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Dropdown Button
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item href="#/image" onClick={downloadAsImage}>As PNG Image</Dropdown.Item>
                            <Dropdown.Item href="#/svg"  onClick={downloadAsSvg}>As SVG</Dropdown.Item>
                            <Dropdown.Item href="#/cert" onClick={handleClick}>As Verifiable Certificate</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={"col-6"}>
                <button className={styles["button"] + " float-right col-12"} onClick={()=>window.print()}>Print</button>
                </div>
            </div>
        </>;
    };

    const multiCertificateView = () => {
        return (
            <div>
                <div className={styles["no-print"]}>
                    <p>There are multiple certificates associated with phone : {userMobileNumber}</p>
                    <b>Please choose the certificate for </b>
                    <div>{getListOfCertificateBearers()}</div>
                </div>
                <div className={styles["sub-container"]}>
                    <div>
                        {certificateData ? selectedCertificate(certificateData) : ("")}
                    </div>
                </div>
            </div>);
    };


    return (
        <div className="row-cols-lg-1 row-cols-1 nav-pad">
            <div className="col-12 d-flex justify-content-center">
        <div className={styles["container"]}>
            <div className={styles["no-print"]}>
                <p>Vaccination certificate</p>
            </div>
            {(certificateList.length > 1) ? multiCertificateView() : singleCertificateView()}
        </div>
            </div>
        </div>);
}

export default CertificateView;

