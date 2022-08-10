const express = require('express');
const multer = require('multer');
const upload = multer();
const { tokenValidationMiddleware, rolePresentValidatorMiddleware } = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, [tokenValidationMiddleware, rolePresentValidatorMiddleware], schemaController.createSchema)
router.put(`/:schemaId/updateTemplate`, [tokenValidationMiddleware, upload.single('files')], schemaController.updateTemplate)
router.put(`/:schemaId/updateTemplateUrl`, [tokenValidationMiddleware], schemaController.updateTemplateUrls)

module.exports = router;
