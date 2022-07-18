const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const issuerController = require('../controllers/issuer.controller');
const {BASE_URL} = require("../configs/config");
const router = express.Router();

router.post(`/`, issuerController.createIssuer)

module.exports = router;
