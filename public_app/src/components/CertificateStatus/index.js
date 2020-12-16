import React, {useEffect, useState} from "react";
import "./index.css";
import CertificateValidImg from "../../assets/img/certificate-valid.svg";
import CertificateInValidImg from "../../assets/img/certificate-invalid.svg";
import MessagePlayImg from "../../assets/img/message-play.svg";
import NextArrowImg from "../../assets/img/next-arrow.svg";
import LearnProcessImg from "../../assets/img/learn_vaccination_process.png";
import FeedbackSmallImg from "../../assets/img/feedback-small.png";
import config from "../../config";
import {pathOr} from "ramda";
import {formatDate} from "../../utils/CustomDate";
import {CustomButton} from "../CustomButton";

const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const {credentialsv1} = require('../../utils/credentials');
const {vaccinationv1} = require('../../utils/vaccinationv1');

const certificateDetailsPaths = {
    "Name": {
        path: ["credentialSubject", "name"],
        format: (data) => (data)
    },
    "Age": {
        path: ["credentialSubject", "age"],
        format: (data) => (data)
    },
    "Gender": {
        path: ["credentialSubject", "gender"],
        format: (data) => (data)
    },
    "Certificate ID": {
        path: ["certificate", "id"],
        format: (data) => (data)
    },
    "Date of Issue": {
        path: ["evidence", "0", "effectiveStart"],
        format: (data) => (formatDate(data))
    },
    "Valid Until": {
        path: ["evidence", "0", "effectiveUntil"],
        format: (data) => (formatDate(data))
    },
    "Vaccination Facility": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    }
};
const customLoader = url => {
    const c = {
        "did:india": config.certificatePublicKey,
        "https://w3id.org/security/v1": contexts.get("https://w3id.org/security/v1"),
        'https://www.w3.org/2018/credentials#': credentialsv1,
        "https://www.w3.org/2018/credentials/v1": credentialsv1
        , "https://www.who.int/2020/credentials/vaccination/v1": vaccinationv1
    };
    let context = c[url];
    if (context === undefined) {
        context = contexts[url];
    }
    if (context !== undefined) {
        return {
            contextUrl: null,
            documentUrl: url,
            document: context
        };
    }
    if (url.startsWith("{")) {
        return JSON.parse(url);
    }
    return documentLoader()(url);
};

export const CertificateStatus = ({data, goBack}) => {
    const [isValid, setValid] = useState(false);
    useEffect(() => {
        async function verifyData() {
            const publicKey = {
                '@context': jsigs.SECURITY_CONTEXT_URL,
                id: 'did:india',
                type: 'RsaVerificationKey2018',
                controller: 'https://example.com/i/india',
                publicKeyPem: config.certificatePublicKey
            };
            const controller = {
                '@context': jsigs.SECURITY_CONTEXT_URL,
                id: 'https://example.com/i/india',
                publicKey: [publicKey],
                // this authorizes this key to be used for making assertions
                assertionMethod: [publicKey.id]
            };
            const key = new RSAKeyPair({...publicKey});
            const {AssertionProofPurpose} = jsigs.purposes;
            const {RsaSignature2018} = jsigs.suites;
            const result = await jsigs.verify(data, {
                suite: new RsaSignature2018({key}),
                purpose: new AssertionProofPurpose({controller}),
                documentLoader: customLoader
            });
            if (result.verified) {
                console.log('Signature verified.');
                setValid(true);
            } else {
                console.log('Signature verification error:', result.error);
                setValid(false);
            }
        }

        verifyData()

    }, []);
    return (
        <div className="certificate-status-wrapper">
            <img src={isValid ? CertificateValidImg : CertificateInValidImg} alt={""}
                 className="certificate-status-image"/>
            <h3 className="certificate-status">
                {
                    isValid ? "Certificate Successfully authenticated!" : "Invalid Certificate"
                }
            </h3>
            {
                isValid && <table className="mt-3">
                    {
                        Object.keys(certificateDetailsPaths).map((key, index) => {
                            const context = certificateDetailsPaths[key];
                            return (
                                <tr key={index}>
                                    <td className="pr-3">{key}</td>
                                    <td className="font-weight-bolder">{context.format(pathOr("NA", context.path, data))}</td>
                                </tr>
                            )
                        })
                    }

                </table>
            }
            <CustomButton className="blue-btn m-3" onClick={goBack}>Verify Another Certificate</CustomButton>
            <SmallInfoCards text={"Provide Feedback"} img={FeedbackSmallImg} backgroundColor={"#FFFBF0"}/>
            <SmallInfoCards text={"Learn about the Vaccination process"} img={LearnProcessImg} backgroundColor={"#EFF5FD"}/>
            <CustomButton className="green-btn mb-5" onClick={goBack}>Message to You <img src={MessagePlayImg}
                                                                                     alt={""}/></CustomButton>
        </div>
    )
};

const SmallInfoCards = ({text, img, onClick, backgroundColor}) => (
    <div className="small-info-card-wrapper mt-3 mb-3" style={{backgroundColor: backgroundColor}}>
        <img src={img} alt={""}/>
        <div onClick={onClick} className="d-flex flex-column align-items-start justify-content-center font-weight-bold pl-3">
            <span>{text}</span>
            <img src={NextArrowImg} alt={""}/>
        </div>
    </div>
);