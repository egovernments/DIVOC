import React, {useEffect, useState} from "react";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import styles from "./CertificateView.module.css";
import QRCode from 'qrcode.react';
import {toPng, toSvg} from 'html-to-image';
import download from 'downloadjs'
import {Dropdown} from "react-bootstrap"
import {formatDate} from "../../utils/CustomDate";
import {pathOr} from "ramda";
import {CertificateDetailsPaths} from "../../constants";
import {Certificate} from "../Certificate";
import {useDispatch} from "react-redux";
import {addEventAction, EVENT_TYPES} from "../../redux/reducers/events";

const certificateDetailsPaths = {
    ...CertificateDetailsPaths,
    "Vaccination": {
        path: ["evidence", "0", "vaccine"]
    },
    "Manufacturer": {
        path: ["evidence", "0", "manufacturer"]
    },
    "Identity": {
        path: ["credentialSubject", "id"]
    }
};

function CertificateView() {
    const {keycloak} = useKeycloak();
    const [certificateList, setCertificateList] = useState([]);
    const [checked, setChecked] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const ref = React.createRef();
    const userMobileNumber = keycloak.idTokenParsed.preferred_username;
    const dispatch = useDispatch();
    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        getCertificate();
    }, []);


    const getCertificate = async () => {
        const response = await axios
            .get("/divoc/api/v1/certificates/" + userMobileNumber, config)
            .then((res) => {
                dispatch(addEventAction({type: EVENT_TYPES.CERTIFICATE_DOWNLOAD, extra: {mobile_number: userMobileNumber}}));
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
                    />
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
    };
    const extractData = (certificateData, key) => {
        return pathOr("NA", certificateDetailsPaths[key].path, certificateData.certificate)
    };

    const showCertificatePreview = (certificateData) => {
        return (
            <>
                <div className={["card", "certificate"]}>

                    <div/>
                    <div className={"right"}/>
                </div>
                <Certificate
                    qrCode={<QRCode size={128} renderAs={"svg"} value={JSON.stringify(certificateData.certificate)}/>}
                    vaccination={extractData(certificateData, "Vaccination")}
                    manufacturer={extractData(certificateData, "Manufacturer")}
                    certificateId={extractData(certificateData, "Certificate ID")}
                    issuedDate={formatDate(extractData(certificateData, "Date of Issue"))}
                    name={extractData(certificateData, "Name")}
                    gender={extractData(certificateData, "Gender")}
                    identityType={"आधार / Aadhaar"}
                    identityNumber={formatIdentity(extractData(certificateData, "Identity"))}
                    age={extractData(certificateData, "Age")}
                    vaccinationCenter={extractData(certificateData, "Vaccination Facility")}
                    dateOfVaccination={formatDate(extractData(certificateData, "Date of Issue"))}
                    vaccinationValidUntil={formatDate(extractData(certificateData, "Valid Until"))}
                />
            </>
        );
    };

    const handleClick = () => {
        console.log(certificateData)
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificateData));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + ".id");
        dlAnchorElem.click();
    };

    const downloadAsSvg = () => {
        toSvg(document.getElementById('certificate'))
            .then(function (dataUrl) {
                console.log(dataUrl);
                download(dataUrl, "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + '.svg');
            });
    }

    const downloadAsImage = () => {
        toPng(document.getElementById('certificate'))
            .then(function (dataUrl) {
                console.log(dataUrl);
                download(dataUrl, "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + '.png');
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
            <div className={styles["top-pad"] + " " + styles["no-print"] + " row"}>
                <div className={"col-6"}>
                    {/*<button className={styles["button"]} onClick={handleClick}>*/}
                    {/*    Download Certificate <img src={DownloadLogo} alt="download"/>*/}
                    {/*</button>*/}
                    {/*<button className={styles["button"]} onClick={downloadAsImage}>*/}
                    {/*    Download Image <img src={DownloadLogo} alt="download"/>*/}
                    {/*</button>*/}
                    <Dropdown className={styles["btn-success"]}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className={"col-12"}>
                            Download
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item href="#/image" onClick={downloadAsImage}>As an image</Dropdown.Item>
                            <Dropdown.Item href="#/svg" onClick={downloadAsSvg}>As SVG</Dropdown.Item>
                            <Dropdown.Item href="#/cert" onClick={handleClick}>As Verifiable Certificate</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className={"col-6"}>
                    <button className={styles["button"] + " float-right col-12"} onClick={() => window.print()}>Print
                    </button>
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

