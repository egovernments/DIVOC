var url = require('url');
const {createPDF} = require("../services/pdf_service")
const QRCode = require('qrcode');
const JSZip = require("jszip");
const {sendEvents} = require("../services/kafka_service");
const registryService = require("../services/registry_service");
const certificateService = require("../services/certificate_service");
const {verifyToken, verifyKeycloakToken} = require("../services/auth_service");
const fhirCertificate = require("certificate-fhir-convertor");
const {privateKeyPem, shcPrivateKeyPem} = require('../../configs/keys');
const config = require('../../configs/config');
const shc = require("@pathcheck/shc-sdk");
const keyUtils = require("../services/key_utils");
const { ConfigurationService, init } = require('../services/configuration_service');
const {TEMPLATES, QR_TYPE} = require('../../configs/constants');
const {formatDate, formatId, concatenateReadableString, padDigit} = require("./../services/utils");

init();
let shcKeyPair = [];
const configurationService = new ConfigurationService();

function formatRecipientAddress(address) {
    return concatenateReadableString(address?.streetAddress, address?.district)
}

const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

function formatDateISO(givenDate) {
    const dob = new Date(givenDate);
    let day = dob.getDate();
    let month = dob.getMonth()+1;
    let year = dob.getFullYear();

    return `${year}-${month}-${padDigit(day)}`;
}

function formatDateTime(givenDateTime) {
    const dob = new Date(givenDateTime);
    let day = dob.getDate();
    let monthName = monthNames[dob.getMonth()];
    let year = dob.getFullYear();
    let hour = dob.getHours();
    let minutes = dob.getMinutes();

    return `${padDigit(day)}-${monthName}-${year} ${hour}:${minutes}`;

}

async function getQRCodeData(certificate, isDataURL) {
    const zip = new JSZip();
        zip.file("certificate.json", certificate, {
            compression: "DEFLATE"
        });
        const zippedData = await zip.generateAsync({type: "string", compression: "DEFLATE"})
            .then(function (content) {
                // console.log(content)
                return content;
            });
        if(isDataURL)
            return await QRCode.toDataURL(zippedData, {scale: 2});
        return await QRCode.toBuffer(zippedData, {scale: 2});
}

async function createCertificateQRCode(certificateResp, res, source) {
    if (certificateResp.length > 0) {
        let certificateRaw = certificateService.getLatestCertificate(certificateResp);
        const qrCode = await getQRCodeData(certificateRaw.certificate, false);
        res.statusCode = 200;
        res.setHeader("Content-Type", "image/png");
        sendEvents({
            date: new Date(),
            source: source,
            type: "internal-success",
            extra: "Certificate found"
        });
        return qrCode;
    } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        let error = {
            date: new Date(),
            source: source,
            type: "internal-failed",
            extra: "Certificate not found"
        };
        sendEvents(error)
        return  JSON.stringify(error);
    }
    return res;
}

async function createCertificatePDF(certificateResp, res, source) {
    if (certificateResp.length > 0) {
        let certificateRaw = certificateService.getLatestCertificate(certificateResp);
        const dataURL = await getQRCodeData(certificateRaw.certificate, true);
        let doseToVaccinationDetailsMap = certificateService.getVaccineDetailsOfPreviousDoses(certificateResp);
        const certificateData = certificateService.prepareDataForVaccineCertificateTemplate(certificateRaw, dataURL, doseToVaccinationDetailsMap);
        const htmlData = await configurationService.getCertificateTemplate(TEMPLATES.VACCINATION_CERTIFICATE);
        let pdfBuffer;
        try {
            pdfBuffer = await createPDF(htmlData, certificateData);
        } catch(err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            console.error(err);
            let error = {
                date: new Date(),
                source: "GetVaccinePDFCertificate",
                type: "internal-failed",
                extra: err.message
            };
            sendEvents(error);
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/pdf");
        sendEvents({
            date: new Date(),
            source: source,
            type: "internal-success",
            extra: "Certificate found"
        });
        return pdfBuffer;
    } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        let error = {
            date: new Date(),
            source: source,
            type: "internal-failed",
            extra: "Certificate not found"
        };
        sendEvents(error)
        return  JSON.stringify(error);
    }
    return res;
}

async function createTestCertificatePDF(certificateResp, res, source) {
    if (certificateResp.length > 0) {
        certificateResp = certificateResp.sort(function(a,b){
            if (a.osUpdatedAt < b.osUpdatedAt) {
                return 1;
            }
            if (a.osUpdatedAt > b.osUpdatedAt) {
                return -1;
            }
            return 0;
        }).reverse();
        let certificateRaw = certificateResp[certificateResp.length - 1];
        const zip = new JSZip();
        zip.file("certificate.json", certificateRaw.certificate, {
            compression: "DEFLATE"
        });
        const zippedData = await zip.generateAsync({type: "string", compression: "DEFLATE"})
          .then(function (content) {
              // console.log(content)
              return content;
          });

        const dataURL = await QRCode.toDataURL(zippedData, {scale: 2});
        certificateRaw.certificate = JSON.parse(certificateRaw.certificate);
        const {certificate: {credentialSubject, evidence}} = certificateRaw;
        const certificateData = {
            name: credentialSubject.name,
            dob: formatDate(credentialSubject.dob),
            gender: credentialSubject.gender,
            identity: formatId(credentialSubject.id),
            recipientAddress: formatRecipientAddress(credentialSubject.address),
            disease: evidence[0].disease,
            testType: evidence[0].testType,
            sampleDate: formatDateTime(evidence[0].sampleCollectionTimestamp),
            resultDate: formatDateTime(evidence[0].resultTimestamp),
            result: evidence[0].result,
            qrCode: dataURL,
            country: evidence[0].facility.address.addressCountry
        };
        const htmlData = await configurationService.getCertificateTemplate(TEMPLATES.TEST_CERTIFICATE);;
        let pdfBuffer;
        try {
            pdfBuffer = await createPDF(htmlData, certificateData);
            res.setHeader("Content-Type", "application/pdf");
        } catch(err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            let error = {
                date: new Date(),
                source: "GetTestPDFCertificate",
                type: "internal-failed",
                extra: err.message
            };
            sendEvents(error);
            return;
        }
        res.statusCode = 200;
        sendEvents({
            date: new Date(),
            source: source,
            type: "internal-success",
            extra: "Certificate found"
        });
        return pdfBuffer;
    } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        let error = {
            date: new Date(),
            source: source,
            type: "internal-failed",
            extra: "Certificate not found"
        };
        sendEvents(error)
        return JSON.stringify(error);
    }
    return res;
}

async function createCertificatePDFByCertificateId(phone, certificateId, res) {
    const certificateResp = await registryService.getCertificate(phone, certificateId);
    return await createCertificatePDF(certificateResp, res, certificateId);
}

async function createCertificatePDFByPreEnrollmentCode(preEnrollmentCode, res) {
    const certificateResp = await registryService.getCertificateByPreEnrollmentCode(preEnrollmentCode);
    return await createCertificatePDF(certificateResp, res, preEnrollmentCode);
}

async function createCertificateQRCodeByPreEnrollmentCode(preEnrollmentCode, res) {
    const certificateResp = await registryService.getCertificateByPreEnrollmentCode(preEnrollmentCode);
    return await createCertificateQRCode(certificateResp, res, preEnrollmentCode);
}

async function createTestCertificatePDFByPreEnrollmentCode(preEnrollmentCode, res) {
    const certificateResp = await registryService.getTestCertificateByPreEnrollmentCode(preEnrollmentCode);
    return await createTestCertificatePDF(certificateResp, res, preEnrollmentCode);
}
async function createCertificateQRCodeCitizen(phone, certificateId, res) {
    const certificateResp = await registryService.getCertificate(phone, certificateId);
    return await createCertificateQRCode(certificateResp, res, certificateId);
}

async function getCertificate(req, res) {
    try {
        var queryData = url.parse(req.url, true).query;
        let claimBody = "";
        try {
            claimBody = await verifyToken(queryData.authToken);
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        const certificateId = req.url.replace("/certificate/api/certificate/", "").split("?")[0];
        res = await createCertificatePDFByCertificateId(claimBody.Phone, certificateId, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}
async function getCertificateQRCode(req, res) {
    try {
        var queryData = url.parse(req.url, true).query;
        let claimBody = "";
        try {
            claimBody = await verifyToken(queryData.authToken);
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        const certificateId = req.url.replace("/certificate/api/certificate/QRCode/", "").split("?")[0];
        res = await createCertificateQRCodeCitizen(claimBody.Phone, certificateId, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function getCertificatePDF(req, res) {
    try {
        var queryData = url.parse(req.url, true).query;
        let claimBody = "";
        let certificateId = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            certificateId = queryData.certificateId;
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        res = await createCertificatePDFByCertificateId(claimBody.preferred_username, certificateId, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function getCertificateQRCodeByPreEnrollmentCode(req, res) {
    try {
        let claimBody = "";
        let preEnrollmentCode = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            preEnrollmentCode = req.url.replace("/certificate/api/certificateQRCode/", "");
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        res = await createCertificateQRCodeByPreEnrollmentCode(preEnrollmentCode, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function getCertificatePDFByPreEnrollmentCode(req, res) {
    try {
        let claimBody = "";
        let preEnrollmentCode = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            preEnrollmentCode = req.url.replace("/certificate/api/certificatePDF/", "");
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        res = await createCertificatePDFByPreEnrollmentCode(preEnrollmentCode, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function getTestCertificatePDFByPreEnrollmentCode(req, res) {
    try {
        let claimBody = "";
        let preEnrollmentCode = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            preEnrollmentCode = req.url.replace("/certificate/api/test/certificatePDF/", "");
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        res = await createTestCertificatePDFByPreEnrollmentCode(preEnrollmentCode, res);
        return res
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function checkIfCertificateGenerated(req, res) {
    try {
        let claimBody = "";
        let preEnrollmentCode = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            preEnrollmentCode = req.url.replace("/certificate/api/certificatePDF/", "");
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        const certificateResp = await registryService.getCertificateByPreEnrollmentCode(preEnrollmentCode);
        if (certificateResp.length > 0) {
            res.statusCode = 200;
            return;
        }
        res.statusCode = 404;
        return;
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function certificateAsFHIRJson(req, res) {
    try {
        var queryData = url.parse(req.url, true).query;
        let claimBody = "";
        let refId = "";
        try {
            claimBody = await verifyKeycloakToken(req.headers.authorization);
            refId = queryData.refId;
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        // check if config are set properly
        if (!config.DISEASE_CODE || !config.PUBLIC_HEALTH_AUTHORITY || !privateKeyPem) {
            console.error("Some of DISEASE_CODE, PUBLIC_HEALTH_AUTHORITY or privateKeyPem is not set to process FHIR certificate");
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            let error = {
                date: new Date(),
                source: refId,
                type: "internal-failed",
                extra: "configuration not set"
            };
            return JSON.stringify(error);
        }
        let certificateResp = await registryService.getCertificateByPreEnrollmentCode(refId);

        const meta = {
            "diseaseCode": config.DISEASE_CODE,
            "publicHealthAuthority": config.PUBLIC_HEALTH_AUTHORITY
        };
        if (certificateResp.length > 0) {
            let certificateRaw = certificateService.getLatestCertificate(certificateResp);
            let certificate = JSON.parse(certificateRaw.certificate);
            // convert certificate to FHIR Json
            try {
                const fhirJson = await fhirCertificate.certificateToFhirJson(certificate, privateKeyPem, meta);
                res.setHeader("Content-Type", "application/json");
                return JSON.stringify(fhirJson)
            } catch (e) {
                console.error(e);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                let error = {
                    date: new Date(),
                    source: "FhirConvertor",
                    type: "internal-failed",
                    extra: e.message
                };
                return JSON.stringify(error)
            }
        } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            let error = {
                date: new Date(),
                source: refId,
                type: "internal-failed",
                extra: "Certificate not found for refId"
            };
            return JSON.stringify(error);
        }
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

async function certificateAsSHCPayload(req, res) {
    let refId;
    let type;
    try {
        var queryData = url.parse(req.url, true).query;
        try {
            await verifyKeycloakToken(req.headers.authorization);
            refId = queryData.refId;
            type = queryData.type;
        } catch (e) {
            console.error(e);
            res.statusCode = 403;
            return;
        }
        // check if config are set properly
        if (!config.SHC_CERTIFICATE_EXPIRY || !config.CERTIFICATE_ISSUER || !shcPrivateKeyPem) {
            console.error("Some of SHC_CERTIFICATE_EXPIRY, CERTIFICATE_ISSUER or shcPrivateKeyPem is not set to process SHC certificate");
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            let error = {
                date: new Date(),
                source: refId,
                type: "internal-failed",
                extra: "configuration not set"
            };
            return JSON.stringify(error);
        }
        let certificateResp = await registryService.getCertificateByPreEnrollmentCode(refId);
        if (certificateResp.length > 0) {
            let certificateRaw = certificateService.getLatestCertificate(certificateResp);
            let certificate = JSON.parse(certificateRaw.certificate);

            // convert certificate to SHC Json
            const shcPayload = fhirCertificate.certificateToSmartHealthJson(certificate, {});

            // get keyPair from pem for 1st time
            if (shcKeyPair.length === 0) {
                const keyFile = keyUtils.PEMtoDER(shcPrivateKeyPem)
                shcKeyPair = await keyUtils.DERtoJWK(keyFile, []);
            }

            const qrUri = await shc.signAndPack(await shc.makeJWT(shcPayload, config.SHC_CERTIFICATE_EXPIRY, config.CERTIFICATE_ISSUER, new Date()), shcKeyPair[0]);

            let buffer ;

            if (type && type.toLowerCase() === QR_TYPE) {
                buffer = await QRCode.toBuffer(qrUri, {scale: 2})
                res.setHeader("Content-Type", "image/png");
            } else {
                const dataURL = await QRCode.toDataURL(qrUri, {scale: 2});
                let doseToVaccinationDetailsMap = certificateService.getVaccineDetailsOfPreviousDoses(certificateResp);
                const certificateData = certificateService.prepareDataForVaccineCertificateTemplate(certificateRaw, dataURL, doseToVaccinationDetailsMap);
                const htmlData = await configurationService.getCertificateTemplate(TEMPLATES.VACCINATION_CERTIFICATE);;
                try {
                    buffer = await createPDF(htmlData, certificateData);
                    res.setHeader("Content-Type", "application/pdf");
                } catch(err) {
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    let error = {
                        date: new Date(),
                        source: "SHCConverter",
                        type: "internal-failed",
                        extra: err.message
                    };
                    sendEvents(error);
                    return;
                }
            }

            res.statusCode = 200;
            sendEvents({
                date: new Date(),
                source: refId,
                type: "shc-cert-success",
                extra: "Certificate found"
            });
            return buffer

        } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            let error = {
                date: new Date(),
                source: refId,
                type: "internal-failed",
                extra: "Certificate not found"
            };
            return JSON.stringify(error);
        }
    } catch (err) {
        console.error(err);
        res.statusCode = 404;
    }
}

module.exports = {
    getCertificate,
    getCertificatePDF,
    getCertificateQRCodeByPreEnrollmentCode,
    getCertificatePDFByPreEnrollmentCode,
    checkIfCertificateGenerated,
    certificateAsFHIRJson,
    getTestCertificatePDFByPreEnrollmentCode,
    getCertificateQRCode,
    certificateAsSHCPayload
};
