const express = require('express');
const { tokenValidator } = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/certify/:entityType`, tokenValidator, certificateController.createCertificate)
router.get(`/certificate/:entityName/:certificateId`, tokenValidator, certificateController.getCertificate)
router.put(`/certify/:entityName/:certificateId`, tokenValidator, certificateController.updateCertificate);

module.exports = router;
