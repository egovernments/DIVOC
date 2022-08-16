const express = require('express');
const multer = require('multer');
const upload = multer();
const { tokenValidationMiddleware } = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, [tokenValidationMiddleware], schemaController.createSchema)
router.get(`/:schemaId?`, [tokenValidationMiddleware], schemaController.getSchema)
router.put(`/:schemaId/updateTemplate`, [tokenValidationMiddleware, upload.single('files')], schemaController.updateTemplate)
router.put(`/:schemaId/updateTemplateUrl`, [tokenValidationMiddleware], schemaController.updateTemplateUrls)

module.exports = router;
