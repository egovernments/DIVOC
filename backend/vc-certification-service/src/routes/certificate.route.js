const express = require('express');
const { tokenValidationMiddleware } = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/certify/:entityType`, tokenValidationMiddleware, certificateController.createCertificate)
router.get(`/certificate/:entityName/:certificateId`, tokenValidationMiddleware, certificateController.getCertificate)
router.put(`/certify/:entityName/:certificateId`, tokenValidationMiddleware, certificateController.updateCertificate);

module.exports = router;
