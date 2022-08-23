const express = require('express');
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/certify/:entityType`, authMiddleware, certificateController.createCertificate)
router.get(`/certificate/:entityName/:certificateId`, authMiddleware, certificateController.getCertificate)
router.put(`/certify/:entityName/:certificateId`, authMiddleware, certificateController.updateCertificate);
router.delete(`/certificate/:entityName/:certificateId`, authMiddleware, certificateController.deleteCertificate);
router.post(`/certificate/revoke`, [authMiddleware, body(["entityName", "certificateId"], "Missing fields").exists()], certificateController.revokeCertificate);
module.exports = router;
