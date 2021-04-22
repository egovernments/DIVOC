import React, {useState} from "react";
import "./index.css";
import VerifyCertificateImg from "../../assets/img/verify-certificate.png"
import SampleCertificateImg from "../../assets/img/sample_ceritificate.png"
import QRCodeImg from "../../assets/img/qr-code.svg"
import {CertificateStatus} from "../CertificateStatus";
import {CustomButton} from "../CustomButton";
import QRScanner from "../QRScanner";
import JSZip from "jszip";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
export const CERTIFICATE_FILE = "certificate.json";

export const VerifyCertificate = () => {
    const [result, setResult] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const handleScan = data => {
        if (data) {
            const zip = new JSZip();
            zip.loadAsync(data).then((contents) => {
                return contents.files[CERTIFICATE_FILE].async('text')
            }).then(function (contents) {
                setResult(contents)
            }).catch(err => {
                    setResult(data)
                }
            );

        }
    };
    const handleError = err => {
        console.error(err)
    };
    return (
        <div className="container-fluid verify-certificate-wrapper">
            {
                !result &&
                <>
                    {!showScanner &&
                    <>
                        <img src={VerifyCertificateImg} className="banner-img" alt="banner-img"/>
                        <h3 className="text-center">Verify a vaccination certificate</h3>
                        <CustomButton className="green-btn" onClick={() => setShowScanner(true)}>
                            <span>Scan QR code</span>
                            <img className="ml-3" src={QRCodeImg} alt={""}/>
                        </CustomButton>
                        <Container className="mt-2 p-4">
                            <p>
                                Once the Covid-19 vaccination is completed, a certificate is issued to the citizens as a proof of vaccination.
                                The vaccination certificate has a secure QR code to protect it against falsification.
                                The genuineness of the certificate can be authenticated from this portal.
                            </p>
                            <p style={{color:"#646D82"}}>Steps for verification</p>
                            <ol className="verify-steps">
                                <li>Click on “Scan QR code” above</li>
                                <li>A notification will prompt to activate your device’s camera</li>
                                <li>Point the camera to the QR code on the certificate issued and scan</li>
                                <li>On successful verification, the following will be displayed
                                    <Row>
                                        <Col>
                                            <ul className="success-verify">
                                                <li>Message “Certificate Successfully Verified”</li>
                                                <li>Name</li>
                                                <li>Age</li>
                                                <li>Gender</li>
                                                <li>Beneficiary Reference ID</li>
                                                <li>Date of Dose</li>
                                                <li>Certificate Issued: Provisional/Final</li>
                                                <li>Vaccination at</li>
                                            </ul>
                                        </Col>
                                        <Col>
                                            <img src={SampleCertificateImg} alt=""/>
                                        </Col>
                                    </Row>
                                </li>
                                <li>If the certificate is not genuine, “Certificate Invalid” will be displayed</li>
                            </ol>
                            <p>You can view a <a href="https://divoc.egov.org.in/demo-videos/13.-certificate-verification" target="_blank">demo video</a> of ‘how to verify’</p>
                            <hr style={{marginTop: "3rem", marginBottom: "3rem"}}/>
                            <p>
                                Private Sector Apps can now incorporate the "Certificate verification" service to verify COVID-19 certificates generated from Co-WIN. </p>
                            <p style={{color:"#646D82"}}>The following steps need to be performed to integrate with Co-WIN and verify the COVID-19 certificate.
                            </p>
                            <ol className="verify-steps">
                                <li>Go to reference code <a href="https://github.com/egovernments/DIVOC/tree/india/verification" target="_blank">here</a></li>
                                <li>Get code snippet for reference and implement</li>
                                <li>Consume COWIN verification service into your application</li>
                                <li>Replace the public key used in code snippet with Public key available <a href="https://verify.cowin.gov.in/did:india" target="_blank">here</a>.</li>
                            </ol>
                            <p>Note: Co-WIN uses an open-source component called "DIVOC" for the certificate issuance & verification service.</p>
                        </Container>
                    </>}
                    {showScanner &&
                    <>
                        <QRScanner onError={handleError}
                                   onScan={handleScan}/>
                        <CustomButton className="green-btn" onClick={() => setShowScanner(false)}>BACK</CustomButton>
                    </>
                    }
                </>
            }
            {
                result && <CertificateStatus certificateData={result} goBack={() => {
                    setShowScanner(false);
                    setResult("");
                }
                }/>
            }


        </div>
    )
};
