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
        let minioOptions = {
            endPoint: config.MINIO_URL,
            useSSL: config.MINIO_USESSL,
            accessKey: config.MINIO_ACCESSKEY,
            secretKey: config.MINIO_SECRETKEY
        }
        if (config.IS_CLOUD_STORAGE) {
            minioOptions = {
                region: config.STORAGE_REGION,
                ...minioOptions
            }
        }
        if(config.IS_MINIO) {
            minioOptions = {
                port: parseInt(config.MINIO_PORT),
                ...minioOptions
            }
        }
        minioClient = new minio.Client(minioOptions);
        if(config.IS_MINIO && !(await minioClient.bucketExists(config.MINIO_BUCKET_NAME))) {
            await minioClient.makeBucket(config.MINIO_BUCKET_NAME);
        }
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