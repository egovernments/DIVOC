const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/certify/:entityType`, authMiddleware, certificateController.createCertificate)
router.get(`/downloadCertificate/:entityName/:certificateId`, authMiddleware, certificateController.getCertificate)

module.exports = router;
