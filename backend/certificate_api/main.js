const certificateController = require("./src/routes/certificate_controller");
const {initKafa} = require("./src/services/kafka_service");
const {initRabbitmq} = require("./src/services/rabbitmq_service");

const http = require('http');
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
    } else {
        res.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    }
    console.timeEnd(req.url)
});

server.listen(port, async () => {
    switch (config.COMMUNICATION_MODE) {
      case config.COMMUNICATION_MODE_RABBITMQ:
        console.log('Choosen mode is RabbitMQ');
        await initRabbitmq();
        break;
      case config.COMMUNICATION_MODE_KAFKA:
        console.log('Choosen mode is Kafka');
        await initKafa();
        break;
      case config.COMMUNICATION_MODE_RESTAPI:
        console.log('Choosen mode is Rest-APIs');
        console.error('Rest-API communication mode isn\'t supported yet');
        break;
      default:
        console.error(`Invalid COMMUNICATION_MODE, ${config.COMMUNICATION_MODE}.`);
    }
    await KeycloakFactory.getPublicKey();
    console.log(`Server listening on port ${port}`);
});
