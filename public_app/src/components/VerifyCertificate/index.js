import React, {useState} from "react";
import QrReader from 'react-qr-reader'
import "./index.css";
import VerifyCertificateImg from "../../assets/img/verify-certificate.png"
import QRCodeImg from "../../assets/img/qr-code.svg"
import {CertificateStatus} from "../CertificateStatus";
import {set} from "ramda";
import {CustomButton} from "../CustomButton";

export const VerifyCertificate = () => {
    const [result, setResult] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const handleScan = data => {
        if (data) {
            setResult(data)
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
                            <span>SCAN WITH QR</span>
                            <img className="ml-3" src={QRCodeImg} alt={""}/>
                        </CustomButton>
                    </>}
                    {showScanner &&
                    <>
                        <QrReader
                            className="qr-camera"
                            delay={100}
                            onError={handleError}
                            onScan={handleScan}
                        />
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
