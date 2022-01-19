import React, { useState } from "react";
import "./index.css";
import VerifyCertificateImg from "../../assets/img/verify-certificate.png";
import LoadingImg from "../../assets/img/loading-buffering.gif";
import QRCodeImg from "../../assets/img/qr-code.svg"
import { CertificateStatus } from "../CertificateStatus";
import { CustomButton } from "../CustomButton";
import QRScanner from "../QRScanner";
import JSZip from "jszip";
import { CERTIFICATE_FILE } from "../../constants";
import Pdf from "../../assets/img/verifyGuide.pdf";

export const VerifyCertificate = () => {
    const [result, setResult] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [showTimeout, setShowTimeout] = useState(false);
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
    const onScanWithQR = () => {
        setShowScanner(true);
        setTimeout(() => {
            if(!result) {
                setShowTimeout(true);
            }
        }, '45000');
    };
    const onTryAgain = () => {
        setShowTimeout(false);
        setShowScanner(false)
    };
    const handleError = err => {
        console.error(err)
    };
    return (
        <div className="container-fluid verify-certificate-wrapper">
            {
                 (!result && !showTimeout) &&
                <>
                    {!showScanner &&
                        <>
                            <img src={VerifyCertificateImg} className="banner-img" alt="banner-img" />
                            <h3 className="text-center">Verify a vaccination certificate</h3><a className="text-center" href={Pdf} without rel="noopener noreferrer" target="_blank"> Guidelines for verification of smart vaccination certificate</a>
                            <CustomButton className="green-btn" onClick={() => onScanWithQR()}>
                                <span>SCAN WITH QR</span>
                                <img className="ml-3" src={QRCodeImg} alt={""} />
                            </CustomButton>
                        </>}
                    {showScanner &&
                        <>
                            <QRScanner onError={handleError}
                                onScan={handleScan} />
                            <span className="mt-2"><img style={{height: "20px"}} className="mr-1" src={LoadingImg} />Detecting QR code</span>
                            <CustomButton className="green-btn" onClick={() => setShowScanner(false)}>BACK</CustomButton>
                        </>
                    }
                </>
            }
            {
                result && <CertificateStatus certificateData={result} goBack={() => {
                    setShowScanner(false);
                    setShowTimeout(false);
                    setResult("");
                }
                } />
            }
            {
                showTimeout &&
                  <>
                      <h4 className="mt-5 text-center">Camera could not read QR code, please try again. </h4>
                      <p className="font-weight-bold mt-5">Guidelines to scan QR code.</p>
                      <ul className="mr-4">
                          <li className="pb-2">Point the camera to the QR code on the middle of the certificate.</li>
                          <li className="pb-2">QR code should cover at-least 75% of screen.</li>
                          <li className="pb-2">All four corners of the QR code should be inside the camera frame.</li>
                          <li className="pb-2">Hold your camera steadily for at-least 5 seconds over the QR code.</li>
                      </ul>
                      <CustomButton className="green-btn" onClick={() => onTryAgain()}>
                          <span>BACK</span>
                      </CustomButton>
                      
                  </>
            }



        </div>
    )
};
