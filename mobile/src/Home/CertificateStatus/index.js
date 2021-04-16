import React, {useEffect, useState} from "react";
import "./index.css";
import CertificateValidImg from "../../assets/img/certificate-valid.svg";
import CertificateInValidImg from "../../assets/img/certificate-invalid.svg";
import config from "../../config";
import {pathOr} from "ramda";
import {CertificateDetailsPaths} from "../../constants";
import Button from "react-bootstrap/Button";
import {ApiServices} from "../../Services/ApiServices";
import {getMessageComponent, LANGUAGE_KEYS} from "../../lang/LocaleContext";
import {getSelectedProgramId} from "../../components/ProgramSelection";
import {appIndexDb, ENROLLMENT_TYPES} from "../../AppDatabase";
import {useOnlineStatus} from "../../utils/offlineStatus";

const jsigs = require('jsonld-signatures');
const {documentLoaders} = require('jsonld');
const {node: documentLoader} = documentLoaders;
const {contexts} = require('security-context');
const credentialsv1 = require('../../utils/credentials.json');
const {vaccinationContext} = require('vaccination-context');

const customLoader = url => {
    const c = {
        "did:india": config.certificatePublicKey,
        "https://example.com/i/india": config.certificatePublicKey,
        "https://w3id.org/security/v1": contexts.get("https://w3id.org/security/v1"),
        'https://www.w3.org/2018/credentials#': credentialsv1,
        "https://www.w3.org/2018/credentials/v1": credentialsv1,
        "https://cowin.gov.in/credentials/vaccination/v1": vaccinationContext,
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

export const CertificateStatus = ({certificateData, goBack, onContinue}) => {
    const isOnline = useOnlineStatus();
    const [isValid, setValid] = useState(false);
    const [data, setData] = useState({});
    const [facilityDetails, setFacilityDetails] = useState({});

    useEffect(() => {
        appIndexDb.getUserDetails().then(facilityDetails => {
            setFacilityDetails(facilityDetails)
        });
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
                const key = new jsigs.RSAKeyPair({...publicKey});
                const {AssertionProofPurpose} = jsigs.purposes;
                const {RsaSignature2018} = jsigs.suites;
                const result = await jsigs.verify(signedJSON, {
                    suite: new RsaSignature2018({key}),
                    purpose: new AssertionProofPurpose({controller}),
                    documentLoader: customLoader,
                    compactProof: false
                });
                if (result.verified) {
                    if (isOnline) {
                        const revokedResponse = await ApiServices.checkIfRevokedCertificate(signedJSON);
                        if (revokedResponse.status === 404) {
                            console.log('Signature verified.');
                            setValid(true);
                            setData(signedJSON);
                            return
                        }
                    } else {
                        setValid(true);
                        setData(signedJSON);
                        return
                    }
                }
                setValid(false);
            } catch (e) {
                console.log('Invalid data', e);
                setValid(false);
            }

        }

        verifyData()

    }, []);


    async function onContinueClick() {
        let patientDetails = {
            address: {
                "addressLine1": data.credentialSubject.address.streetAddress,
                "addressLine2": data.credentialSubject.address.streetAddress2,
                "district": data.credentialSubject.address.district,
                "pincode": data.credentialSubject.address.postalCode,
                "state": data.credentialSubject.address.addressRegion
            },
            "code": data.credentialSubject.refId,
            "comorbidities": data.credentialSubject.comorbidities || [],
            "email": data.credentialSubject.email || "",
            "enrollmentType": "SELF_ENRL",
            "gender": data.credentialSubject.gender,
            "identity": data.credentialSubject.id,
            "name": data.credentialSubject.name,
            "nationalId": data.credentialSubject.nationality,
            "phone": data.credentialSubject.refId.split("-")[0],
            "yob": new Date().getFullYear()-parseInt(data.credentialSubject.age),
            "appointments": [{
                "appointmentDate": data.evidence[0].date.slice(0, 10),
                "appointmentSlot": "",
                "certificateId": data.evidence[0].certificateId,
                "certified": true,
                "dose": data.evidence[0].dose,
                "enrollmentScopeId": facilityDetails["facility_code"],
                "programId": getSelectedProgramId(),
                "vaccine": data.evidence[0].vaccine
            }]
        }
        await appIndexDb.saveEnrollments([patientDetails])
        return patientDetails
    }

    return (
        <div className="certificate-status-wrapper">
            <img style={{maxHeight:"50px"}} src={isValid ? CertificateValidImg : CertificateInValidImg} alt={""}
                 className="certificate-status-image"/>
            <h4 className="certificate-status">
                {
                    isValid ? "Certificate Successfully Scanned" : "Invalid Certificate"
                }
            </h4>
            {
                isValid &&
                <>
                <table className="mt-2">
                    {
                        Object.keys(CertificateDetailsPaths).map((key, index) => {
                            const context = CertificateDetailsPaths[key];
                            return (
                                <tr key={index} style={{fontSize:"small"}}>
                                    <td className="pr-3">{key}</td>
                                    <td className="font-weight-bolder">{context.format(pathOr("NA", context.path, data))}</td>
                                </tr>
                            )
                        })
                    }
                </table>
                    <Button variant="outline-primary" className="primary-btn w-100 mt-5"
                            onClick={() => onContinueClick().then(pd => onContinue(pd.code))}>
                        {getMessageComponent(LANGUAGE_KEYS.PRE_ENROLLMENT_CONTINUE)}
                    </Button>
                </>
            }
            <Button variant="outline-primary" className="action-btn w-100 mt-3" onClick={goBack}>BACK</Button>
        </div>
    )
};
