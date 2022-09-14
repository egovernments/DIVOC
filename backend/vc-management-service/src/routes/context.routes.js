const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const minio = require('minio');
const {tokenValidationMiddleware} = require('../middleware/auth.middleware');
const {addContext, updateContext, getContext} = require('../controllers/context.controller');
const config = require('../configs/config');
const constants = require('../configs/constants');
const redisService = require('../services/redis.service');
let minioClient;

(async function() {
    try {
        minioClient = new minio.Client({
            endPoint: config.MINIO_URL,
            port: parseInt(config.MINIO_PORT),
            useSSL: config.MINIO_USESSL,
            accessKey: config.MINIO_ACCESSKEY,
            secretKey: config.MINIO_SECRETKEY,
        });
        if(!(await minioClient.bucketExists(constants.MINIO_BUCKET_NAME)))
            await minioClient.makeBucket(constants.MINIO_BUCKET_NAME);
        if(config.REDIS_ENABLED) {
            await redisService.initRedis({REDIS_URL: config.REDIS_URL});
        }
    } catch(err) {
        console.error(err);
    }
})();

router.post('/', [tokenValidationMiddleware, upload.single('files')], (req, res) => addContext(req, res, minioClient));
router.put('/:osid',[tokenValidationMiddleware, upload.single('files')],(req,res) => updateContext(req,res,minioClient));
router.get('/:osid', (req, res) => getContext(req, res, minioClient));

module.exports = router;