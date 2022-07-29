const express = require('express');
const multer = require('multer');
const upload = multer();

const { tokenValidator } = require('../middleware/auth.middleware');
const templateController = require('../controllers/template.controller');
const router = express.Router();

router.post(`/:issuer`, [tokenValidator, upload.single('files')], templateController.uploadTemplate);

module.exports = router