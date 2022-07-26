const express = require('express');
const multer = require('multer');
const upload = multer();
const authMiddleware = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, authMiddleware, schemaController.createSchema)
router.put(`/:schemaId`, authMiddleware, schemaController.updateSchema)
router.put(`/:schemaId/updateTemplate`, [authMiddleware, upload.single('files')], schemaController.updateTemplate)
router.put(`/:schemaId/updateTemplateUrl`, authMiddleware, schemaController.updateTemplateUrls)

module.exports = router;
