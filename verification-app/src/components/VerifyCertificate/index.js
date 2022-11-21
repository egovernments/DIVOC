import React, {useState, useEffect} from "react";
import "./index.css";
import VerifyCertificateImg from "../../assets/img/verify-certificate.png"
import LoadingImg from "../../assets/img/loading-buffering.gif"
import QRCodeImg from "../../assets/img/qr-code.svg"
import LogoImg from "../../assets/img/nav-logo.png"
import {VcCertificateStatus} from "../VcCertificateStatus";
import {CertificateStatus} from "../CertificateStatus";
import {CustomButton} from "../CustomButton";
import QRScanner from "../QRScanner";
import JSZip from "jszip";
import {CERTIFICATE_FILE} from "../../constants";
import {useTranslation} from "react-i18next";
import config from "../../config"
import Info from "./VerifyInstructions";

export const VerifyCertificate = () => {
    const [result, setResult] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [showTimeout, setShowTimeout] = useState(false);
    const [timerClocked, setTimerClocked] = useState(false);
    const {t} = useTranslation();

    const handleScan = data => {
        if (data) {
            const zip = new JSZip();
            zip.loadAsync(data).then((contents) => {
                return contents.files[CERTIFICATE_FILE].async('text')
            }).then(function (contents) {
                setResult(contents);
            }).catch(err => {
                    setResult(data)
                }
            );

        }
    };
    const handleError = err => {
        console.error(err)
    };

    useEffect(() => {
        if(timerClocked && result === '') {
            setShowTimeout(true);
        }
    });

    const onScanWithQR = () => {
        setShowScanner(true);
        setTimerClocked(false);
        setTimeout(() => {
            setTimerClocked(true);
        }, config.CERTIFICATE_SCAN_TIMEOUT);
    };

    const onTryAgain = () => {
        setShowTimeout(false);
        setShowScanner(false);
        setTimerClocked(false);
    };
    return (
        <div className="container-fluid verify-certificate-wrapper">
            {
                (!result && !showTimeout) &&
                <>
                    {!showScanner &&
                    <>
                        <img src={VerifyCertificateImg} className="banner-img" alt="banner-img"/>
                        <h3 className="text-center">{t('verifyCertificate.title')}</h3>
                        <CustomButton className="green-btn" onClick={() => onScanWithQR()}>
                            <span>{t('verifyCertificate.scanWithQR')}</span>
                            <img className="ms-3" src={QRCodeImg} alt={""}/>
                        </CustomButton>
                        <Info/>
                    </>}
                    {showScanner &&
                    <>
                        <QRScanner onError={handleError}
                                   onScan={handleScan}/>
                        <span className="mt-2"><img style={{height: "20px"}} className="mr-1" src={LoadingImg} />Detecting QR code</span>
                        <CustomButton className="green-btn text-uppercase" onClick={() => setShowScanner(false)}>{t('button.back')}</CustomButton>
                    </>
                    }
                </>
            }
            {
               result && (JSON.parse(config.CERTIFICATE_STATUS_VC) ? 
                        <VcCertificateStatus certificateData={result} goBack={() => {
                            setShowScanner(false);
                            setShowTimeout(false);
                            setTimerClocked(false);
                            setResult("");
                        }}/>
                        :
                        <CertificateStatus certificateData={result} goBack={() => {
                            setShowScanner(false);
                            setShowTimeout(false);
                            setTimerClocked(false);
                            setResult("");
                        }}/>
                    )
            }
            {
                showTimeout &&
                  <>
                      <h1 className="mt-5 text-center">{t('verifyCertificate.pageTitle')}</h1>
                      <h4 className="mt-5 text-center">{t('verifyCertificate.timeoutTitle')}</h4>
                      <CustomButton className="blue-btn" onClick={() => onTryAgain()}>
                          <span>{t('verifyCertificate.tryAgain')}</span>
                      </CustomButton>
                      <div className="w-75 mx-auto text-start">
                      <ul className="list-unstyled" >
                          <lh className="mt-5">{t('verifyCertificate.timeoutInfo')}</lh>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.0')}</li>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.1')}</li>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.2')}</li>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.3')}</li>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.4')}</li>
                          <li className="pb-2 ps-5">{t('verifyCertificate.timeoutInfoList.5')}</li>
                      </ul>
                      </div>
                      
                  </>
            }


        </div>
    )
};
