import {Button} from "react-bootstrap";
import React, {useState} from "react";
import {FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, usePreEnrollment} from "./PreEnrollmentFlow";
import Form from "react-bootstrap/Form";
import "./EnterPreEnrollment.scss"
import {BaseFormCard} from "../../components/BaseFormCard";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import QRScanner from "../QRScanner";
import JSZip from "jszip";
import {CertificateStatus} from "../CertificateStatus";

export const CERTIFICATE_FILE = "certificate.json"

export function PreEnrollmentCode(props) {
    return (
        <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.VERIFY_RECIPIENT)}>
            <EnterPreEnrollmentContent/>
        </BaseFormCard>
    )
}

function EnterPreEnrollmentContent(props) {
    const {state, goNext} = usePreEnrollment()
    const [enrollCode, setEnrollCode] = useState(state.enrollCode);
    const [showScanner, setShowScanner] = useState(false);
    const [result, setResult] = useState("");

    const handleEnrollCodeOnChange = (e) => {
        if (e.target.value.length <= 13) {
            setEnrollCode(e.target.value)
        }
    }

    const handleError = err => {
        console.error(err)
    };

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

    return  (
        <div className="enroll-code-container">
            {
                !result &&
                <>
                    {!showScanner &&
                    <>
                        <Button variant="outline-primary"
                                className="blue-btn-outline w-100 mt-5 mb-5"
                                onClick={() => setShowScanner(true)}>
                            {getMessageComponent(LANGUAGE_KEYS.RECIPIENT_SCAN_QR_CODE)}
                        </Button>
                        <div className="scan-qr">
                            <span>OR</span>
                        </div>
                        <div>
                            <Form.Group>
                                <label className="mb-0 mt-1">{getMessageComponent(LANGUAGE_KEYS.RECIPIENT_ENTER_ENROLMENT_NUMBER)}</label>
                                <Form.Control type="text" tabIndex="1" value={enrollCode}
                                              onChange={handleEnrollCodeOnChange}/>
                            </Form.Group>
                        </div>
                        <Button variant="outline-primary" className="primary-btn w-100 mt-5 mb-5" onClick={() => {
                            if (enrollCode)
                                goNext(FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, {
                                    enrollCode: enrollCode
                                })
                            else {
                                alert("Please enter enrollment number");
                                return false
                            }
                        }}>{getMessageComponent(LANGUAGE_KEYS.PRE_ENROLLMENT_CONTINUE)}</Button>
                    </>}
                    {showScanner &&
                        <div className="mt-2">
                            <QRScanner onError={handleError}
                                       onScan={handleScan}/>
                            <Button variant="outline-primary" className="primary-btn w-100 mt-5 mb-5" onClick={() => setShowScanner(false)}>BACK</Button>
                        </div>
                    }
                </>
            }
            {
                result && <CertificateStatus certificateData={result} goBack={() => {
                    setShowScanner(false);
                    setResult("");
                }
                }
                onContinue={(enrollCode) => {
                    goNext(FORM_PRE_ENROLL_CODE, FORM_PRE_ENROLL_DETAILS, {
                        enrollCode: enrollCode
                    })
                }
                }
                />
            }


        </div>
    )
}
