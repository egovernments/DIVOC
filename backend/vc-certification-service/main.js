const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const morganBody = require('morgan-body');
const {Kafka} = require('kafkajs');

const certifyConfig = require('./src/configs/config');
const {BASE_URL} = require("./src/configs/config");
let {certifyRouter, setKafkaProducer} = require('./src/routes/certificate.route');
let {cronJob, setKafkaProducerForScheduler} = require('./src/services/scheduler.service');

const swaggerDocument = yaml.load('./certification-service-swagger.yml');

const app = express();
const port = certifyConfig.PORT;

const kafka = new Kafka({
    clientId: 'vc-signer',
    brokers: certifyConfig.KAFKA_BOOTSTRAP_SERVERS.split(',')
});
const producer = kafka.producer({allowAutoTopicCreation: true});
setKafkaProducer(producer);

setKafkaProducerForScheduler(producer);
cronJob();

app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

morganBody(app, {
    dateTimeFormat: 'iso',
    maxBodyLength: 1000000
});

app.use(`${BASE_URL}v1`, certifyRouter);

app.use(
    `${BASE_URL}api-docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).json({
        message: "No such route exists"
    })
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: "Error Message"
    })
});

app.listen(port, async () => {
    console.log(`Server listening on port: ${port}`);
});
