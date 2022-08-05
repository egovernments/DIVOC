const express = require('express');
const { roleAuthorizer, tokenValidationMiddleware } = require('../middleware/auth.middleware');
const issuerController = require('../controllers/issuer.controller');
const {BASE_URL} = require("../configs/config");
const router = express.Router();

router.post(`/`, [tokenValidationMiddleware ,roleAuthorizer], issuerController.createIssuer)

module.exports = router;
