const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, authMiddleware, schemaController.createSchema)
router.put(`/:schemaId`, authMiddleware, schemaController.updateSchema)

module.exports = router;
