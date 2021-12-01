const certificateController = require("./src/routes/certificate_controller");
const {initKafa} = require("./src/services/kafka_service");
const {initRabbitmq} = require("./src/services/rabbitmq_service");

const http = require('http');
const config = require("./configs/config");
const {KeycloakFactory} = require("./src/services/keycloak_service");

const port = process.env.PORT || 4321;

const server = http.createServer(async (req, res) => {
    console.time(req.url)
    console.log(`API ${req.method} ${req.url} called`);
    if (req.method === 'GET' && req.url.startsWith("/certificate/api/certificate/")) {
        const data = await certificateController.getCertificate(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.match("/certificate/api/certificatePDF/.+")) {
        const data = await certificateController.getCertificatePDFByPreEnrollmentCode(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.startsWith("/certificate/api/certificatePDF")) {
        const data = await certificateController.getCertificatePDF(req, res);
        res.end(data)
    } else if (req.method === 'HEAD' && req.url.match("/certificate/api/certificatePDF/.+")) {
        const data = await certificateController.checkIfCertificateGenerated(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.startsWith("/certificate/api/fhir-certificate")) {
        const data = await certificateController.certificateAsFHIRJson(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.startsWith("/certificate/api/eu-certificate")) {
        const data = await certificateController.certificateAsEUPayload(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.match("/certificate/api/test/certificatePDF/.+")) {
        const data = await certificateController.getTestCertificatePDFByPreEnrollmentCode(req, res);
        res.end(data)
    } else if (req.method === 'GET' && req.url.match("/certificate/api/certificateQRCode/.+")) {
        const data = await certificateController.getCertificateQRCodeByPreEnrollmentCode(req, res);
        res.end(data)
    } else {
        res.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    }
    console.timeEnd(req.url)
});

server.listen(port, async () => {
    if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_RABBITMQ) {
        console.log('Chosen mode is RabbitMQ');
        await initRabbitmq();
    } else if (config.COMMUNICATION_MODE === config.COMMUNICATION_MODE_KAFKA) {
        console.log('Chosen mode is Kafka');
        await initKafa();
    } else {
        console.error(`Invalid COMMUNICATION_MODE, ${config.COMMUNICATION_MODE}.`);
        return null;
    }
    await KeycloakFactory.getPublicKey();
    console.log(`Server listening on port ${port}`);
});
