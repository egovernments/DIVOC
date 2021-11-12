const fs = require('fs');
var url = require('url');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const JSZip = require("jszip");
const {sendEvents} = require("../services/kafka_service");
const {sendEvents} = require("../services/rabbitmq_service");
const registryService = require("../services/registry_service");
const {verifyToken, verifyKeycloakToken} = require("../services/auth_service");

function getNumberWithOrdinal(n) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + " " + (s[(v - 20) % 10] || s[v] || s[0]);
}

function appendCommaIfNotEmpty(address, suffix) {
    if (address.trim().length > 0) {
        if (suffix.trim().length > 0) {
            return address + ", " + suffix
        } else {
            return address
        }
    }
    return suffix
}

function concatenateReadableString(a, b) {
    let address = "";
    address = appendCommaIfNotEmpty(address, a);
    address = appendCommaIfNotEmpty(address, b);
    if (address.length > 0) {
        return address
    }
    return "NA"
}

function formatRecipientAddress(address) {
    return concatenateReadableString(address.streetAddress, address.district)
}

function formatFacilityAddress(evidence) {
    return concatenateReadableString(evidence.facility.name, evidence.facility.address.district)
}

function formatId(identity) {
    const split = identity.split(":");
    const lastFragment = split[split.length - 1];
    if (identity.includes("aadhaar") && lastFragment.length >= 4) {
        return "Aadhaar # XXXX XXXX XXXX " + lastFragment.substr(lastFragment.length - 4)
    }
    if (identity.includes("Driving")) {
        return "Driver’s License # " + lastFragment
    }
    if (identity.includes("MNREGA")) {
        return "MNREGA Job Card # " + lastFragment
    }
    if (identity.includes("PAN")) {
        return "PAN Card # " + lastFragment
    }
    if (identity.includes("Passbooks")) {
        return "Passbook # " + lastFragment
    }
    if (identity.includes("Passport")) {
        return "Passport # " + lastFragment
    }
    if (identity.includes("Pension")) {
        return "Pension Document # " + lastFragment
    }
    if (identity.includes("Voter")) {
        return "Voter ID # " + lastFragment
    }
    return lastFragment
}

const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

function formatDate(givenDate) {
    const dob = new Date(givenDate);
    let day = dob.getDate();
    let monthName = monthNames[dob.getMonth()];
    let year = dob.getFullYear();

    return `${padDigit(day)}-${monthName}-${year}`;
}

function padDigit(digit, totalDigits = 2) {
    return String(digit).padStart(totalDigits, '0')
}

function getVaccineValidDays(start, end) {
    const a = new Date(start);
    const b = new Date(end);
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

async function createCertificatePDF(certificateResp, res, source) {
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
            age: credentialSubject.age,
            gender: credentialSubject.gender,
            identity: formatId(credentialSubject.id),
            beneficiaryId: credentialSubject.refId,
            recipientAddress: formatRecipientAddress(credentialSubject.address),
            vaccine: evidence[0].vaccine,
            vaccinationDate: formatDate(evidence[0].date) + ` (Batch no. ${evidence[0].batch} )`,
            vaccineValidDays: `after ${getVaccineValidDays(evidence[0].effectiveStart, evidence[0].effectiveUntil)} days`,
            vaccinatedBy: evidence[0].verifier.name,
            vaccinatedAt: formatFacilityAddress(evidence[0]),
            qrCode: dataURL,
            dose: evidence[0].dose,
            totalDoses: evidence[0].totalDoses,
            isFinalDose: evidence[0].dose === evidence[0].totalDoses,
            currentDoseText: `(${getNumberWithOrdinal(evidence[0].dose)} Dose)`
        };
        const htmlData = fs.readFileSync(`${__dirname}/../../configs/templates/certificate_template.html`, 'utf8');
        const template = Handlebars.compile(htmlData);
        let certificate = template(certificateData);
        const browser = await puppeteer.launch({
            headless: true,
            //comment to use default
            executablePath: '/usr/bin/chromium-browser',
            args: [
                "--no-sandbox",
                "--disable-gpu",
            ]
        });
        const page = await browser.newPage();
        await page.evaluateHandle('document.fonts.ready');
        await page.setContent(certificate, {
            waitUntil: 'domcontentloaded'
        });
        // await page.pdf({
        //     format: 'A4',
        //     path: `${__dirname}/divoc-invoice.pdf`
        // });
        const pdfBuffer = await page.pdf({
            format: 'A4'
        });

        // close the browser
        await browser.close();
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

async function createCertificatePDFByCertificateId(phone, certificateId, res) {
    const certificateResp = await registryService.getCertificate(phone, certificateId);
    return await createCertificatePDF(certificateResp, res, certificateId);
}

async function createCertificatePDFByPreEnrollmentCode(preEnrollmentCode, res) {
    const certificateResp = await registryService.getCertificateByPreEnrollmentCode(preEnrollmentCode);
    return await createCertificatePDF(certificateResp, res, preEnrollmentCode);
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

module.exports = {
    getCertificate,
    getCertificatePDF,
    getCertificatePDFByPreEnrollmentCode,
    checkIfCertificateGenerated
};
