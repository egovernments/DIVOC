import React, {useEffect, useState} from "react";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import styles from "./CertificateView.module.css";
import QRCode from 'qrcode.react';
import {toPng, toSvg} from 'html-to-image';
import download from 'downloadjs'
import {Container, Dropdown,DropdownButton, Row} from "react-bootstrap"
import {formatDate} from "../../utils/CustomDate";
import {pathOr} from "ramda";
import {CERTIFICATE_FILE, CertificateDetailsPaths} from "../../constants";
import {FinalCertificate} from "../Certificate/finalCertificate";
import {ProvisionalCertificate} from "../Certificate/provisionalCertificate";
import {useDispatch} from "react-redux";
import digilocker from "../../assets/img/digilocker.png"
import commonPass from "../../assets/img/CommonPass.png"
import JSZip from "jszip";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

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
    },
    "Info Url": {
        path: ["evidence", "0", "infoUrl"]
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
    const [width, setWidth] = useState(window.innerWidth);
    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        getCertificate();
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);


    const getCertificate = async () => {
        let {certificates} = await axios
            .get("/cert/api/certificates", config)
            .then((res) => {
                return res.data;
            });
        for (let i = 0; i < certificates.length; i++) {
            const zip = new JSZip();
            const cert = JSON.stringify(certificates[i].certificate);
            zip.file(CERTIFICATE_FILE, cert, {
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9
                }
            });
            const zippedData = await zip.generateAsync({type: "binarystring"})
                .then(function (content) {
                    // console.log(content)
                    return content;
                });
            certificates[i].compressedData = zippedData
        }

        console.log(certificates);
        setCertificateList(certificates);
        if (certificates.length === 1) {
            setCertificateData(certificates[0]);
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
            let arr = id.split(":");
            return arr[arr.length - 1];
        } catch (e) {
            return "";
        }
    };
    const extractData = (certificateData, key) => {
        return pathOr("NA", certificateDetailsPaths[key].path, certificateData.certificate)
    };
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const showCertificatePreview = (certificateData) => {
        return (
            <div id="certificate">
                <Document
                    file={{ url: '/cert/api/certificatePDF?certificateId='+certificateData.certificateId, httpHeaders: { 'Authorization': config.headers.Authorization }, withCredentials: true }}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    {Array.from(
                        new Array(numPages),
                        (el, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                scale={width <= 768 ? 0.6 : 1}
                            />
                        ),
                    )}
                </Document>
            </div>
        );
    };

    const handleClick = () => {
        console.log(certificateData);
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
    };

    const downloadAsImage = () => {
        const certificateDiv = document.getElementById("certificate");
        const url = certificateDiv.firstChild.firstChild.firstChild.toDataURL("image/png")
        let link = document.createElement('a');
        link.download = "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + '.png';
        link.href = url;
        link.click();
    };

    function printCanvas()
    {
        const certificateDiv = document.getElementById("certificate");
        const dataUrl = certificateDiv.firstChild.firstChild.firstChild.toDataURL("image/png")
        var windowContent = '<!DOCTYPE html>';
        windowContent += '<html>'
        windowContent += '<head><title>Print canvas</title></head>';
        windowContent += '<body>'
        windowContent += '<img src="' + dataUrl + '" style="">';
        windowContent += '</body>';
        windowContent += '</html>';
        const printWin = window.open('', '', '');
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();

        printWin.document.addEventListener('load', function() {
            printWin.focus();
            printWin.print();
            // setTimeout(function(){printWin.close();}, 5000);
        }, true);

    }

    const singleCertificateView = () => {
        return (
            <Container className={styles["certificate"]+ " " + styles["center-align"]}>
                {certificateList.length === 1 ? selectedCertificate(certificateList[0]) : ("")}
            </Container>
        );
    };


    const selectedCertificate = (certificateData) => {
        return <>
            {showCertificatePreview(certificateData)}
            <div className={styles["top-pad"] + " " + styles["no-print"] + " "+ styles["center-align"]}>
                <div >
                    {/*<button className={styles["button"]} onClick={handleClick}>*/}
                    {/*    Download Certificate <img src={DownloadLogo} alt="download"/>*/}
                    {/*</button>*/}
                    {/*<button className={styles["button"]} onClick={downloadAsImage}>*/}
                    {/*    Download Image <img src={DownloadLogo} alt="download"/>*/}
                    {/*</button>*/}

                    <DropdownButton id="dropdown-item-button" variant="success" title="Download" className={styles["btn-success"]}>
                        <Dropdown.Item href="" onClick={downloadAsImage}>As Image</Dropdown.Item>
                        <Dropdown.Item href="" onClick={downloadAsSvg}>As SVG</Dropdown.Item>
                        <Dropdown.Item href="" onClick={handleClick}>As Verifiable Certificate</Dropdown.Item>
                    </DropdownButton>
                </div>
                {/*<div >*/}
                {/*    /!*<button className={styles["button"]} onClick={handleClick}>*!/*/}
                {/*    /!*    Download Certificate <img src={DownloadLogo} alt="download"/>*!/*/}
                {/*    /!*</button>*!/*/}
                {/*    /!*<button className={styles["button"]} onClick={downloadAsImage}>*!/*/}
                {/*    /!*    Download Image <img src={DownloadLogo} alt="download"/>*!/*/}
                {/*    /!*</button>*!/*/}

                {/*    <DropdownButton id="dropdown-item-button" variant="success" title="Export" className={styles["btn-success"]}>*/}
                {/*        <Dropdown.Item href="#/image" onClick={downloadAsImage}><img src={digilocker} className={styles["export-icon"]}></img>to DigiLocker</Dropdown.Item>*/}
                {/*        <Dropdown.Item href="#/svg" onClick={()=>alert("This feature is still not implemented")}><img src={commonPass}  className={styles["common-pass"]}></img>to CommonPass</Dropdown.Item>*/}
                {/*    </DropdownButton>*/}
                {/*    */}
                {/*</div>*/}
                <div>
                    <button className={styles["button"]} onClick={printCanvas}>Print</button>
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        </>;
    };

    const multiCertificateView = () => {
        return (
            <Container>
                <Container className={styles["no-print"] + " " + styles["center-align"]}>
                    <Row>
                        <p>There are multiple certificates associated with phone : {userMobileNumber + "\n"}</p>
                    </Row>
                    <Row>
                        <b>Please choose the certificate for </b>
                    </Row>
                    <div>{getListOfCertificateBearers()}</div>
                </Container>
                <Container className={styles["certificate"]+ " " + styles["center-align"]}>
                        {certificateData ? selectedCertificate(certificateData) : ("")}
                </Container>
            </Container>);
    };


    return (
        <div className={"nav-pad cert-top"}>
            <div className="justify-content-center">
                <div>
                    <div className={styles["no-print"] + " " + styles["center-align"]}>
                        <h4>Vaccination certificate</h4>
                    </div>
                    {(certificateList.length > 1) ? multiCertificateView() : singleCertificateView()}
                </div>
            </div>
        </div>);
}

export default CertificateView;

