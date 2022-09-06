const constants = require('../configs/constants');
const config = require('../configs/config');
const sunbirdRegistryService = require('../services/sunbird.service');
const redisService = require('../services/redis.service');

async function addContext(req, res, minioClient) {
    const filename = req.baseUrl + "/" + req.file.originalname;
    const file = req.file.buffer;
    let fileStr = file.toString();
    fileStr = fileStr.replaceAll('\n', '');
    try {
        JSON.parse(fileStr);
        await minioClient.putObject(constants.MINIO_BUCKET_NAME, filename, file);
        const response = await sunbirdRegistryService.createEntity(constants.MINIO_CONTEXT_URL, {url: filename}, req.header('Authorization'));
        if(config.REDIS_ENABLED) {
            redisService.storeKeyWithExpiry(response.result.ContextURL.osid.substring(2), fileStr);
        }
        res.status(200).json({
            message: response,
            url: req.baseUrl + "/" + response.result.ContextURL.osid.substring(2)
        });
    }
    catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function getContext(req, res, minioClient) {
    try {
        if(config.REDIS_ENABLED) {
            let value = await redisService.getKey(req.params.osid);
            if(value === undefined || value === null) {
                return await getContextFromMinio(req, res, minioClient);
            }
            res
            .status(200)
            .set({'Content-Type': 'application/ld+json'})
            .json(
                JSON.parse(value)
            );
            return;
        }
        return await getContextFromMinio(req, res, minioClient);
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function getContextFromMinio(req, res, minioClient) {
    const url = (await sunbirdRegistryService.getEntity(constants.MINIO_CONTEXT_URL, req.header('Authorization')))[0].url;
    const value = await minioClient.getObject(constants.MINIO_BUCKET_NAME, url);
    let data = '';
    value.on('data', function (chunk) {
        data += chunk;
    });
    value.on('end', function (chunk) {
        if (chunk !== undefined)
            data += chunk;
        res.status(200).set({ 'Content-Type': 'application/ld+json' }).json(JSON.parse(data.toString()));
        redisService.storeKeyWithExpiry(req.params.osid, data.toString());
    });
    return;
}


module.exports = {
    addContext,
    getContext
}