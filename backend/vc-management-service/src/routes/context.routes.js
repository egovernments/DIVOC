const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const minio = require('minio');
const {tokenValidationMiddleware} = require('../middleware/auth.middleware');
const {addContext} = require('../controllers/context.controller');
const config = require('../configs/config');
const constants = require('../configs/constants');
let minioClient;

(async function() {
    minioClient = new minio.Client({
        endPoint: config.MINIO_URL,
        port: parseInt(config.MINIO_PORT),
        useSSL: config.MINIO_USESSL,
        accessKey: config.MINIO_ACCESSKEY,
        secretKey: config.MINIO_SECRETKEY,
    });
    if(!(await minioClient.bucketExists(constants.MINIO_BUCKET_NAME)))
        await minioClient.makeBucket(constants.MINIO_BUCKET_NAME, config.MINIO_REGION);
})();

router.post('/', [tokenValidationMiddleware, upload.single('files')], (req, res) => addContext(req, res, minioClient));

module.exports = router;