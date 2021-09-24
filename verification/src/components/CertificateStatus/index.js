import React, {useEffect, useState} from "react";
import "./index.css";
import CertificateValidImg from "../../assets/img/certificate-valid.svg";
import CertificateInValidImg from "../../assets/img/certificate-invalid.svg";
import NextArrowImg from "../../assets/img/next-arrow.svg";
// import LearnProcessImg from "../../assets/img/leanr_more_small.png";
// import FeedbackSmallImg from "../../assets/img/feedback-small.png";
// import DownloadSmallImg from "../../assets/img/download-certificate-small.png";
import config from "../../config";
import {pathOr} from "ramda";
import {CustomButton} from "../CustomButton";
import {CertificateDetailsPaths} from "../../constants";
import {useDispatch} from "react-redux";
import {addEventAction, EVENT_TYPES} from "../../redux/reducers/events";
import {useHistory} from "react-router-dom";
import axios from "axios";
import {ordinal_suffix_of} from "../../utils/utils";
import {Loader} from "../Loader";

const jsigs = require('jsonld-signatures');
const {RSAKeyPair} = require('crypto-ld');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const credentialsv1 = require('../../utils/credentials.json');
const {vaccinationContext, vaccinationContextV2} = require('vaccination-context');

const customLoader = url => {
    console.log("checking " + url);
    const c = {
        "did:india": config.certificatePublicKey,
        "https://example.com/i/india": config.certificatePublicKey,
        "https://w3id.org/security/v1": contexts.get("https://w3id.org/security/v1"),
        'https://www.w3.org/2018/credentials#': credentialsv1,
        "https://www.w3.org/2018/credentials/v1": credentialsv1,
        "https://cowin.gov.in/credentials/vaccination/v1": vaccinationContext,
        "https://cowin.gov.in/credentials/vaccination/v2": vaccinationContextV2,
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
    console.log("Fallback url lookup for document :" + url)
    return documentLoader()(url);
};

export const CertificateStatus = ({certificateData, goBack}) => {
    const [isLoading, setLoading] = useState(false);
    const [isValid, setValid] = useState(false);
    const [data, setData] = useState({});
    const history = useHistory();

    setTimeout(()=>{
        try {
            axios
              .post("/divoc/api/v1/events/", {"date":new Date().toISOString(), "type":"verify"})
              .catch((e) => {
                console.log(e);
            });
        } catch (e) {
            console.log(e);
        }
    }, 100)

    const dispatch = useDispatch();
    useEffect(() => {
        setLoading(true);
        async function verifyData() {
            try {
                const signedJSON = JSON.parse(certificateData);
                const publicKey = {
                    '@context': jsigs.SECURITY_CONTEXT_URL,
                    id: 'did:india',
                    type: 'RsaVerificationKey2018',
                    controller: 'https://cowin.gov.in/',
                    publicKeyPem: config.certificatePublicKey
                };
                const controller = {
                    '@context': jsigs.SECURITY_CONTEXT_URL,
                    id: 'https://cowin.gov.in/',
                    publicKey: [publicKey],
                    // this authorizes this key to be used for making assertions
                    assertionMethod: [publicKey.id]
                };
                const key = new RSAKeyPair({...publicKey});
                const {AssertionProofPurpose} = jsigs.purposes;
                const {RsaSignature2018} = jsigs.suites;
                const result = await jsigs.verify(signedJSON, {
                    suite: new RsaSignature2018({key}),
                    purpose: new AssertionProofPurpose({controller}),
                    documentLoader: customLoader,
                    compactProof: false
                });
                if (result.verified) {
                    const revokedResponse = await checkIfRevokedCertificate(signedJSON)
                    if (revokedResponse.response.status !== 200) {
                        console.log('Signature verified.');
                        setValid(true);
                        setData(signedJSON);
                        dispatch(addEventAction({
                            type: EVENT_TYPES.VALID_VERIFICATION,
                            extra: signedJSON.credentialSubject
                        }));
                        setLoading(false);
                        return;
                    }
                }
                dispatch(addEventAction({type: EVENT_TYPES.INVALID_VERIFICATION, extra: signedJSON}));
                setValid(false);
                setLoading(false);
            } catch (e) {
                console.log('Invalid data', e);
                setValid(false);
                dispatch(addEventAction({type: EVENT_TYPES.INVALID_VERIFICATION, extra: certificateData}));
                setLoading(false);
            }

        }
        setTimeout(() => {
            verifyData()
        }, 500)

    }, []);

    async function checkIfRevokedCertificate(data) {
        return axios
            .post("/divoc/api/v1/certificate/revoked", data)
            .then((res) => {
                dispatch(addEventAction({type: EVENT_TYPES.REVOKED_CERTIFICATE, extra: certificateData}));
                return res
            }).catch((e) => {
                console.log(e);
                return e
            });
    }

    function getCertificateStatusAsString(data) {
        if (!data || !data["evidence"]) {
            return ""
        }

        const dose = data["evidence"][0]["dose"]
        const totalDoses = data["evidence"][0]["totalDoses"] || 2

        if (dose === totalDoses) {
            return "Final Certificate for COVID-19 Vaccination"
        } else {
            return `Provisional Certificate for COVID-19 Vaccination (${getDose(data)} Dose)`
        }
    }

    function getDose(data) {
        if (!data || !data["evidence"]) {
            return ""
        }
        return ordinal_suffix_of(data["evidence"][0]["dose"])
    }

    return (
        isLoading ? <Loader/> : <div className="certificate-status-wrapper">
            <img src={isValid ? CertificateValidImg : CertificateInValidImg} alt={""}
                 className="certificate-status-image"/>
            <h3 className="certificate-status">
                {
                    isValid ? "Certificate Successfully Verified" : "Certificate Invalid"
                }
            </h3>
            <br/>
            {
                isValid && <h5>
                    {
                        getCertificateStatusAsString(data)
                    }
                </h5>
            }
            {
                isValid && <table className="mt-3">
                    {
                        Object.keys(CertificateDetailsPaths).map((key, index) => {
                            const context = CertificateDetailsPaths[key];
                            const value = context.format(pathOr("NA", context.path, data));
                            const show = value !== "NA" || (value === "NA" && !context.optional)
                            return (
                              show && <tr key={index} style={{fontSize:"smaller", textAlign: "left"}}>
                                    <td className="pr-3" >{key.replace("${dose}", getDose(data))}</td>
                                    <td className="font-weight-bolder value-col">{value}</td>
                                </tr>
                            )
                        })
                    }

                </table>
            }
            <br/>
            <CustomButton className="blue-btn m-3" onClick={goBack}>Verify Another Certificate</CustomButton>
            {/*<SmallInfoCards text={"Provide Feedback"}*/}
            {/*                onClick={() => {*/}
            {/*                    history.push("/side-effects")*/}
            {/*                }}*/}
            {/*                img={FeedbackSmallImg} backgroundColor={"#FFFBF0"}/>*/}
            {/*<SmallInfoCards text={"Learn about the Vaccination process"} img={LearnProcessImg}*/}
            {/*               onClick={() => {*/}
            {/*                    history.push("/learn")*/}
            {/*                }}*/}
            {/*                backgroundColor={"#EFF5FD"}/>*/}
        </div>
    )
};

export const SmallInfoCards = ({text, img, onClick, backgroundColor}) => (
    <div className="small-info-card-wrapper mt-3 mb-3" style={{backgroundColor: backgroundColor}}>
        <div className="w-50 ">
            <img src={img} alt={""} className="small-card-img float-right"/>
        </div>
        <div onClick={onClick}
             className="w-50 d-flex flex-column align-items-start justify-content-center font-weight-bold">
            <span>{text}</span>
            <img src={NextArrowImg} alt={""}/>
        </div>
    </div>
);
