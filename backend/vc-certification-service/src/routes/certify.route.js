const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const certificateController = require('../controllers/certificate.controller');

const router = express.Router();

router.post(`/:entityType`, authMiddleware, certificateController.createCertificate)

module.exports = router;
