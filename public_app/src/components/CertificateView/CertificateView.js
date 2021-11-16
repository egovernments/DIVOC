import React, {useEffect, useState} from "react";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import styles from "./CertificateView.module.css";
import {toSvg} from 'html-to-image';
import download from 'downloadjs'
import {Container, Dropdown,DropdownButton, Row} from "react-bootstrap"
import {pathOr} from "ramda";
import {CERTIFICATE_FILE, CertificateDetailsPaths} from "../../constants";
import {useDispatch} from "react-redux";
import JSZip from "jszip";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation();
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
                    file={{ url: '/certificate/api/certificatePDF?certificateId='+certificateData.certificateId, httpHeaders: { 'Authorization': config.headers.Authorization }, withCredentials: true }}
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

    function downloadAsFhirCertificate() {
        axios.get(`/certificate/api/fhir-certificate?refId=${certificateData.preEnrollmentCode}`, {...config, responseType: 'blob'})
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            var dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute('href', url);
            dlAnchorElem.setAttribute('download', 'Vaccination_Certificate.json');
            dlAnchorElem.click();
        }).catch(err => console.log(err));
    }

    function downloadAsEUCertificate() {
        axios.get(`/certificate/api/eu-certificate?refId=${certificateData.preEnrollmentCode}`, {...config, responseType: 'blob'})
        .then((blob) => {
            const file = new Blob([blob.data], {type: 'application/pdf'});
            var url = URL.createObjectURL(file);
            var dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", url);
            dlAnchorElem.setAttribute("download", "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + ".pdf");
            dlAnchorElem.click();
            dlAnchorElem.remove();
        }).catch(err => console.log(err));
    }

    const handleClick = () => {
        console.log(certificateData);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificateData));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "Vaccination_Certificate_" + certificateData.name.replaceAll(" ", "_") + ".id");
        dlAnchorElem.click();
        dlAnchorElem.remove();
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

                    <DropdownButton id="dropdown-item-button" variant="success" title={t('button.download')} className={styles["btn-success"]}>
                        <Dropdown.Item href="" onClick={downloadAsImage}>{t('certificateView.asImg')}</Dropdown.Item>
                        <Dropdown.Item href="" onClick={downloadAsSvg}>{t('certificateView.asSvg')}</Dropdown.Item>
                        <Dropdown.Item href="" onClick={handleClick}>{t('certificateView.asVerifiableCertificate')}</Dropdown.Item>
                        <Dropdown.Item href="" onClick={downloadAsEUCertificate}>{t('certificateView.asEuCertificate')}</Dropdown.Item>
                        <Dropdown.Item href="" onClick={downloadAsFhirCertificate}>{t('certificateView.asFhirCertificate')}</Dropdown.Item>
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
                    <button className={styles["button"]} onClick={printCanvas}>{t('button.print')}</button>
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
                        <p>{t('certificateView.subTitle', {mobileNumber: userMobileNumber})}</p>
                    </Row>
                    <Row>
                        <b>{t('certificateView.chooseCertificate')}</b>
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
                        <h4>{t('certificateView.title')}</h4>
                    </div>
                    {(certificateList.length > 1) ? multiCertificateView() : singleCertificateView()}
                </div>
            </div>
        </div>);
}

export default CertificateView;

