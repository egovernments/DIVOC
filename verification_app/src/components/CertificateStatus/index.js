import React, {useEffect, useState} from "react";
import "./index.css";
import CertificateValidImg from "../../assets/img/certificate-valid.svg";
import CertificateInValidImg from "../../assets/img/certificate-invalid.svg";
import NextArrowImg from "../../assets/img/next-arrow.svg";
import LearnProcessImg from "../../assets/img/leanr_more_small.png";
import FeedbackSmallImg from "../../assets/img/feedback-small.png";
import config, {
    CERTIFICATE_CONTROLLER_ID,
    CERTIFICATE_DID,
    CERTIFICATE_NAMESPACE, CERTIFICATE_NAMESPACE_V2,
    CERTIFICATE_PUBKEY_ID, CERTIFICATE_SIGNED_KEY_TYPE, certificatePublicKeyBase58
} from "../../config";
import {pathOr} from "ramda";
import {CustomButton} from "../CustomButton";
import {CertificateDetailsPaths} from "../../constants";
import {useDispatch} from "react-redux";
import {addEventAction, EVENT_TYPES} from "../../redux/reducers/events";
import {useHistory} from "react-router-dom";
import axios from "axios";
import {Loader} from "../Loader";
import {useTranslation} from "react-i18next";

const {contexts} = require('security-context');
const credentialsv1 = require('../../utils/credentials.json');
const {vaccinationContext, vaccinationContextV2} = require('vaccination-context');

const {verifyJSON, init_signer} = require('certificate-signer-library');

let signingConfig = {
    publicKeyPem: config.certificatePublicKey,
    publicKeyBase58: config.certificatePublicKeyBase58,
    CERTIFICATE_DID: CERTIFICATE_DID,
    CERTIFICATE_PUBKEY_ID: CERTIFICATE_PUBKEY_ID,
    CERTIFICATE_CONTROLLER_ID: CERTIFICATE_CONTROLLER_ID,
    keyType: CERTIFICATE_SIGNED_KEY_TYPE
};
let documentLoaderMapping = {
    [CERTIFICATE_DID]: config.certificatePublicKey,
    [CERTIFICATE_PUBKEY_ID]: config.certificatePublicKey,
    "https://w3id.org/security/v1": contexts.get("https://w3id.org/security/v1"),
    'https://www.w3.org/2018/credentials#': credentialsv1,
    "https://www.w3.org/2018/credentials/v1": credentialsv1,
    [CERTIFICATE_NAMESPACE]: vaccinationContext,
    [CERTIFICATE_NAMESPACE_V2]: vaccinationContextV2,
}

export const CertificateStatus = ({certificateData, goBack}) => {
    const [isLoading, setLoading] = useState(true);
    const [isValid, setValid] = useState(false);
    const [isRevoked, setRevoked] = useState(false);
    const [data, setData] = useState({});
    const history = useHistory();
    const {t} = useTranslation();

    setTimeout(()=>{
        try {
            axios
              .post("/divoc/api/v1/events/", [{"date":new Date().toISOString(), "type":"verify"}])
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
        init_signer(signingConfig, {}, documentLoaderMapping);
        async function verifyData() {
            try {
                const signedJSON = JSON.parse(certificateData);
                const result = await verifyJSON(signedJSON);
                if (result.verified) {
                    const revokedResponse = await checkIfRevokedCertificate(signedJSON);
                    if (revokedResponse.status === 404) {
                        console.log('Signature verified.');
                        setValid(true);
                        setData(signedJSON);
                        setRevoked(false);
                        dispatch(addEventAction({
                            type: EVENT_TYPES.VALID_VERIFICATION,
                            extra: signedJSON.credentialSubject
                        }));
                        setLoading(false);
                        return
                    }else if(revokedResponse.status === 200){
                        console.log('Certificate revoked.');
                        setValid(false);
                        setData(signedJSON);
                        setRevoked(true);
                        dispatch(addEventAction({
                            type: EVENT_TYPES.REVOKED_CERTIFICATE,
                            extra: signedJSON.credentialSubject
                        }));
                        setLoading(false);
                        return
                    }
                }
                dispatch(addEventAction({type: EVENT_TYPES.INVALID_VERIFICATION, extra: signedJSON}));
                setValid(false);
                setLoading(false);
            } catch (e) {
                console.log('Invalid data', e);
                setValid(false);
                dispatch(addEventAction({type: EVENT_TYPES.INVALID_VERIFICATION, extra: certificateData}));

            } finally {
                setLoading(false);
            }

        }

        verifyData()

    }, []);

    async function checkIfRevokedCertificate(data) {
        return axios
            .post("/divoc/api/v1/certificate/revoked", data)
            .then((res) => {
                dispatch(addEventAction({type: EVENT_TYPES.REVOKED_CERTIFICATE, extra: certificateData}));
                return res
            }).catch((e) => {
                console.log(e.response);
                return e.response
            });
    }

    return (
        isLoading ? <Loader/> :
                <div className="certificate-status-wrapper">
                    <img src={isValid ? CertificateValidImg : CertificateInValidImg} alt={""}
                         className="certificate-status-image"/>
                    <h3 className="certificate-status">
                        {
                            isValid ? t('verifyCertificate.validStatus') : (isRevoked ? t('verifyCertificate.revokedStatus') : t('verifyCertificate.invalidStatus'))
                        }
                    </h3>
                    {
                        isRevoked   && <h4>{ t('verifyCertificate.revokeText')}</h4>
                    }
                    {
                        isValid && <table className="mt-3">
                            {
                                Object.keys(CertificateDetailsPaths).map((key, index) => {
                                    const context = CertificateDetailsPaths[key];
                                    return (
                                        <tr key={index}>
                                            <td className="pr-3">{t('certificate.'+key)}</td>
                                            <td className="font-weight-bolder">{context.format(pathOr("NA", context.path, data))}</td>
                                        </tr>
                                    )
                                })
                            }

                        </table>
                    }
                    <CustomButton className="blue-btn m-3" onClick={goBack}>{t('verifyCertificate.verifyAnotherCertificate')}</CustomButton>
                    <SmallInfoCards text={t('verifyCertificate.infoCard.0.text')}
                                    onClick={() => {
                                        history.push("/side-effects")
                                    }}
                                    img={FeedbackSmallImg} backgroundColor={"#FFFBF0"}/>
                    <SmallInfoCards text={t('verifyCertificate.infoCard.1.text')} img={LearnProcessImg}
                                    onClick={() => {
                                        history.push("/learn")
                                    }}
                                    backgroundColor={"#EFF5FD"}/>
                </div>
    )
};

export const SmallInfoCards = ({text, img, onClick, backgroundColor}) => (
    <div className="small-info-card-wrapper mt-3 mb-3" style={{backgroundColor: backgroundColor}} onClick={onClick}>
        <div className="w-50 ">
            <img src={img} alt={""} className="small-card-img float-right"/>
        </div>
        <div 
             className="w-50 d-flex flex-column align-items-start justify-content-center font-weight-bold">
            <span>{text}</span>
            <img src={NextArrowImg} alt={""}/>
        </div>
    </div>
);
