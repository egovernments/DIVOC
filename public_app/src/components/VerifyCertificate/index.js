import React, {useState} from "react";
import "./index.css";
import VerifyCertificateImg from "../../assets/img/verify-certificate.png"
import QRCodeImg from "../../assets/img/qr-code.svg"
import {CertificateStatus} from "../CertificateStatus";
import {CustomButton} from "../CustomButton";
import QRScanner from "../QRScanner";
import JSZip from "jszip";
import {CERTIFICATE_FILE} from "../../constants";
import {useTranslation} from "react-i18next";
import config from "../../config"

export const VerifyCertificate = () => {
    const [result, setResult] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [showTimeout, setShowTimeout] = useState(false);
    const {t} = useTranslation();
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

    const onScanWithQR = () => {
        setShowScanner(true);
        setTimeout(() => {
            if(!result) {
                setShowTimeout(true);
            }
        }, config.CERTIFICATE_SCAN_TIMEOUT);
    };

    const onTryAgain = () => {
        setShowTimeout(false);
        setShowScanner(false)
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
                            <img className="ml-3" src={QRCodeImg} alt={""}/>
                        </CustomButton>
                    </>}
                    {showScanner &&
                    <>
                        <QRScanner onError={handleError}
                                   onScan={handleScan}/>
                        <CustomButton className="green-btn text-uppercase" onClick={() => setShowScanner(false)}>{t('button.back')}</CustomButton>
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
                }/>
            }
            {
                showTimeout &&
                  <>
                      <img src={VerifyCertificateImg} className="banner-img" alt="banner-img"/>
                      <h3 className="text-center">{t('verifyCertificate.timeoutTitle')}</h3>
                      <CustomButton className="green-btn" onClick={() => onTryAgain()}>
                          <span>{t('verifyCertificate.tryAgain')}</span>
                      </CustomButton>
                  </>
            }


        </div>
    )
};
