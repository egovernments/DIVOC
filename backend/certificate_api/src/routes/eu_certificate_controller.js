var url = require('url');
const {verifyKeycloakToken} = require("../services/auth_service");
const euCertificateService = require("../services/eu_certficate_service");
const registryService = require("../services/registry_service");
const dcc = require("@pathcheck/dcc-sdk");
const {euPrivateKeyPem, euPublicKeyP8} = require('../../configs/keys');
const config = require('../../configs/config');
const certificateService = require("../services/certificate_service");
const {TEMPLATES, QR_TYPE} = require("../../configs/constants");
const {sendEvents} = require("../services/kafka_service");
const QRCode = require('qrcode');
const { ConfigurationService } = require('../services/configuration_service');

const configurationService = new ConfigurationService();

async function certificateAsEUPayload(req, res) {
  try {
    var queryData = url.parse(req.url, true).query;
    let requestBody = {};
    try {
      await verifyKeycloakToken(req.headers.authorization);
      refId = queryData.refId;
      type = queryData.type;
    } catch (e) {
      console.error(e);
      res.statusCode = 403;
      return;
    }

    requestBody = await getRequestBody(req, res)

    // check request body
    if (!euCertificateService.validateEURequestBody(requestBody)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      let error = {
        date: new Date(),
        source: "EUCertificateConverter",
        type: "invalid-input",
        extra: "Invalid request body"
      };
      return JSON.stringify(error);
    }

    // check if config are set properly
    if (!config.EU_CERTIFICATE_EXPIRY || !config.PUBLIC_HEALTH_AUTHORITY || !euPublicKeyP8 || !euPrivateKeyPem) {
      console.error("Some of EU_CERTIFICATE_EXPIRY, PUBLIC_HEALTH_AUTHORITY, euPublicKeyP8 or euPrivateKeyPem is not set to process EU certificate");
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
      // convert certificate to EU Json
      let dccPayload;
      try {
        dccPayload = await certificateService.convertCertificateToDCCPayload(certificateRaw, requestBody);
      } catch(err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        let error = {
          date: new Date(),
          source: "EUCertificateConverter",
          type: "internal-failed",
          extra: err.message
        };
        sendEvents(error);
        return JSON.stringify(error);
      }
      const qrUri = await dcc.signAndPack(await dcc.makeCWT(dccPayload, config.EU_CERTIFICATE_EXPIRY, dccPayload.v[0].co), euPublicKeyP8, euPrivateKeyPem);
      let buffer = null;
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
            source: "EUCertificateConverter",
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
        type: "eu-cert-success",
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

const getRequestBody = async (req) => {
  const buffers = []
  for await (const chunk of req) {
    buffers.push(chunk)
  }

  const data = Buffer.concat(buffers).toString();
  if (data === "") return undefined;
  return JSON.parse(data);
};

module.exports = {
  certificateAsEUPayload
}