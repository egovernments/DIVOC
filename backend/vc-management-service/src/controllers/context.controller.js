const constants = require('../configs/constants');
const config = require('../configs/config');
const sunbirdRegistryService = require('../services/sunbird.service');
const redisService = require('../services/redis.service');

async function addContext(req, res, minioClient) {
    const filename = req.baseUrl + "/" + req.file.originalname;
    await minioClient.putObject(constants.MINIO_BUCKET_NAME, filename, req.file.buffer);
    try {
        const response = await sunbirdRegistryService.createEntity(constants.MINIO_CONTEXT_URL, {url: filename}, req.header('Authorization'));
        if(config.REDIS_ENABLED) {
            redisService.storeKeyWithExpiry(response.result.ContextURL.osid.substring(2), filename);
        }
        res.status(200).json({
            message: response
        });
    }
    catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    addContext
}