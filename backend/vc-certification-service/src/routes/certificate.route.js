const express = require('express');
const { tokenValidationMiddleware } = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/certify/:entityType`, tokenValidationMiddleware, certificateController.createCertificate)
router.get(`/certificate/:entityName/:certificateId`, tokenValidationMiddleware, certificateController.getCertificate)
router.put(`/certify/:entityName/:certificateId`, tokenValidationMiddleware, certificateController.updateCertificate);
router.delete(`/certificate/:entityName/:certificateId`, tokenValidationMiddleware, certificateController.deleteCertificate);

module.exports = router;
