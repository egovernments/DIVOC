const express = require('express');
const { roleAuthorizer, tokenValidationMiddleware } = require('../middleware/auth.middleware');
const tenantController = require('../controllers/tenant.controller');
const {BASE_URL} = require("../configs/config");
const router = express.Router();

router.post(`/`, [tokenValidationMiddleware ,roleAuthorizer], tenantController.createTenant)
router.get(`/generatetoken/:userId`, tenantController.generateToken)

module.exports = router;
