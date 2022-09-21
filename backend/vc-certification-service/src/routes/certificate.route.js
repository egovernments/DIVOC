const express = require('express');
const {body, param} = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();
let kafkaProducer;
const setKafkaProducer = (producer) => {
    kafkaProducer = producer;
}

router.post(`/certify/:entityType`, authMiddleware, (req, res) => certificateController.createCertificate(req, res, kafkaProducer))
router.get(`/certificate/:entityName/:certificateId`, authMiddleware, certificateController.getCertificate)
router.put(`/certify/:entityType`, authMiddleware, (req, res) => certificateController.updateCertificate(req, res, kafkaProducer));
router.post(`/certificate/revoke`, [authMiddleware, body(["entityName", "certificateId"], "Missing entityName or CertificateId in request body").exists()], certificateController.revokeCertificate);
router.delete(`/certificate/revoke/:entityName/:revokedCertificateId`, [authMiddleware, param([ "entityName","revokedCertificateId"], "Missing entityName or Revoked CertificateId in request body").exists()], (req, res) => certificateController.deleteRevokeCertificate(req, res, kafkaProducer));
router.post(`/certificate/verify`, certificateController.verifyCertificate);
module.exports = {certifyRouter: router, setKafkaProducer}
