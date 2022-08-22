const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();
let kafkaProducer;
const setKafkaProducer = (producer) => {
    kafkaProducer = producer;
}

router.post(`/certify/:entityType`, authMiddleware, (req, res) => certificateController.createCertificate(req, res, kafkaProducer))
router.get(`/certificate/:entityName/:certificateId`, authMiddleware, certificateController.getCertificate)
router.put(`/certify/:entityName/:certificateId`, authMiddleware, certificateController.updateCertificate);
router.delete(`/certificate/:entityName/:certificateId`, authMiddleware, certificateController.deleteCertificate);

module.exports = {certifyRouter: router, setKafkaProducer}
