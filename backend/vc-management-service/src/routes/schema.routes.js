const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, authMiddleware, schemaController.createSchema)

module.exports = router;
