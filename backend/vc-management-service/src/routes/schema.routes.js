const express = require('express');
const multer = require('multer');
const upload = multer();
const { tokenValidator } = require('../middleware/auth.middleware');
const schemaController = require('../controllers/schema.controller');

const router = express.Router();

router.post(`/`, tokenValidator, schemaController.createSchema)
router.put(`/:schemaId/updateTemplate`, [tokenValidator, upload.single('files')], schemaController.updateTemplate)
router.put(`/:schemaId/updateTemplateUrl`, tokenValidator, schemaController.updateTemplateUrls)

module.exports = router;
