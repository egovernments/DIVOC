import React, {useEffect, useState} from "react";
import "./index.css";
import CertificateValidImg from "../../assets/img/certificate-valid.svg";
import CertificateInValidImg from "../../assets/img/certificate-invalid.svg";
import NextArrowImg from "../../assets/img/next-arrow.svg";
import {pathOr} from "ramda";
import {CustomButton} from "../CustomButton";
import axios from "axios";
import {Loader} from "../Loader";
import {useTranslation} from "react-i18next";

let suspensionDate = "";
let suspensionExpiry = "";
let revocationDate = "";

export const VcCertificateStatus = ({certificateData, goBack}) => {
    const [isLoading, setLoading] = useState(true);
    const [isValid, setValid] = useState(false);
    const [isSuspended, setSuspended] = useState(false)
    const [isRevoked, setRevoked] = useState(false);
    const [data, setData] = useState({});
    const {t} = useTranslation();
    
    console.log("VcCertificateStatus");
    useEffect(() => {
        setLoading(true);
        async function verifyData() {
            try {
                const signedJSON = JSON.parse(certificateData);
                const result = await verifyCertificate(signedJSON);
                console.log(result.status)
                switch (result.status.certificateStatus){
                    case "VALID" : 
                            setValid(true);
                            setRevoked(false);
                            setSuspended(false);
                        break;
                    case "SUSPENDED":
                            setValid(false);
                            setRevoked(true);
                            setSuspended(true);
                            suspensionDate = result.status.startDate;
                            suspensionExpiry = result.status.endDate;
                        break;
                    case "REVOKED":
                            setValid(false);
                            setRevoked(true);
                            setSuspended(false);
                            revocationDate = result.status.startDate;
                        break;
                    default: 
                            setValid(false);
                            setRevoked(false);
                            setSuspended(false);;
                }
                setData(signedJSON);
            } catch (e) {
                console.log('Invalid data', e);
                setValid(false);
            } finally {
                setLoading(false);
            }

        }

        verifyData()

    }, []);

    async function verifyCertificate(data) {
        return axios.post("/vc-certification/v1/certificate/verify",data)
                .then(res => res.data)
                .catch((e) => {
                    console.log(e.response);
                    return e.response
                });
    }

    const convertToString = (value) => {
        let str = '';
        str += Object.keys(value)
            .filter((a) => {
                if (typeof value[a] === 'object') return convertToString(value[a]);
                return value[a] !== '';
            })
            .map((a) => {
                if (typeof value[a] === 'object') return convertToString(value[a]);
                return value[a];
            });
        return str;
    };
      
    const getPathAndKey = (data, key) => {
        let arr = [];
        for (let i = 0; i < key.t.length; i++) {
            if (Array.isArray(data[key.keys])) {
            for (let j = 0; j < data[key.keys].length; j++) {
                arr.push({ path: [key.keys, j, key.t[i]], key: key.t[i] });
            }
            } else {
            arr.push({ path: [key.keys, key.t[i]], key: key.t[i] });
            }
        }
        return arr;
    }
      
    const getRequiredFieldsToShow = (data, keys) => {
        const temp = Array.isArray(data[keys])
            ? data[keys][0]
            : data[keys];
        const t = Object.keys(temp).filter(
            (key) =>
            key !== 'type' &&
            (key.toLowerCase().indexOf('id') < 0 || key === 'certificateId') &&
            key.toLowerCase().indexOf('url') < 0 
        );
        return { keys, t };
    }

    const standardizeString = (str) => {
        return (str.charAt(0).toUpperCase()+str.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
    }

    const getRow = (context, index) => {
        return (
            <tr key={index}>
                <td className="px-3 text-start" >{standardizeString(context.key) + ":"}</td>
                <td className="pe-4 fw-bolder text-start" >
                    {typeof pathOr('NA', context.path, data) === 'object' &&
                        convertToString(pathOr('NA', context.path, data))}
                    {typeof pathOr('NA', context.path, data) !== 'object' &&
                        pathOr('NA', context.path, data)}
                </td>
            </tr>
        );
    }

    return (
        isLoading ? <Loader/> :
                <div className="certificate-status-wrapper">
                    <img src={isValid ? CertificateValidImg : CertificateInValidImg} alt={""}
                         className="certificate-status-image"/>
                    <h2 className="certificate-status fw-bolder">
                        {
                            isValid ? t('verifyCertificate.validStatus') : (isRevoked ? (isSuspended ? t('verifyCertificate.suspendedStatus') : t('verifyCertificate.revokedStatus')) : t('verifyCertificate.invalidStatus'))
                        }
                    </h2>
                    {
                        isRevoked   && (isSuspended ? 
                        <><h4>{t('verifyCertificate.suspendText')}</h4><h4>{t('verifyCertificate.suspensionDate', { suspensionDate: new Date(suspensionDate).toLocaleDateString() })}</h4><h4>{t('verifyCertificate.suspensionExpiry', { suspensionExpiry: new Date(suspensionExpiry).toLocaleDateString() })}</h4></> 
                        :
                        <><h4>{t('verifyCertificate.revokeText')}</h4><h4>{t('verifyCertificate.revocationDate', { revocationDate: new Date(revocationDate).toLocaleDateString() })}</h4></>)
                        
                    }
                    {
                        isValid && <table className="mt-3 py-3 border border-dark " >
                            {
                                Object.keys(data)
                                .filter((keys) => keys === 'evidence' || keys === 'credentialSubject')
                                .map((keys) => getRequiredFieldsToShow(data, keys))
                                .map((key) => getPathAndKey(data, key))
                                .reduce((pre, curr) => pre.concat(curr))
                                .map((context, index) => getRow(context, index))
                            }

                        </table>
                    }
                    <CustomButton className="blue-btn m-3" onClick={goBack}>{t('verifyCertificate.verifyAnotherCertificate')}</CustomButton>
                    {
                        !isValid && !isRevoked && <h5>{t('verifyCertificate.invalidText')}</h5>
                    }
                    {
                        !isValid && <h5>{t('verifyCertificate.contactForDetails')}</h5>
                    }
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
