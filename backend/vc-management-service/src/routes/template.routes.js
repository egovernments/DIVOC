const express = require('express');
const multer = require('multer');
const upload = multer();

const authMiddleware = require('../middleware/auth.middleware');
const templateController = require('../controllers/template.controller');
const router = express.Router();

router.post(`/:issuer/:issuerId`, [authMiddleware, upload.single('files')], templateController.uploadTemplate);

module.exports = router