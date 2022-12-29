const express = require('express');
const multer = require('multer');
const upload = multer();

const { tokenValidationMiddleware } = require('../middleware/auth.middleware');
const templateController = require('../controllers/template.controller');
const router = express.Router();

router.post(`/:tenant`, [tokenValidationMiddleware, upload.single('files')], templateController.uploadTemplate);
router.get(`/` , templateController.getTemplate);
module.exports = router