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

async function updateContext(req,res,minioClient){
    const filename = req.baseUrl + "/" + req.file.originalname;
    const file = req.file.buffer;
    let fileStr = file.toString();
    fileStr = fileStr.replaceAll('\n', '');
    const osid = req.params.osid;
    try{
        JSON.parse(fileStr);
        const getContextResp = await sunbirdRegistryService.getContext(osid,req.header('Authorization'));
        console.log("getContextResp: " ,getContextResp);
        await minioClient.putObject(constants.MINIO_BUCKET_NAME, filename, file);
        const updateContextResp = await sunbirdRegistryService.updateContext(osid,{url: filename},req.header('Authorization'));
        console.log("updateContextResp: ",updateContextResp);
        if(config.REDIS_ENABLED) {
            redisService.storeKeyWithExpiry(osid, fileStr);
        }
        if(filename != getContextResp.url){
            minioClient.removeObject(constants.MINIO_BUCKET_NAME, getContextResp.url);
        }
        res.status(200).json({
            message: updateContextResp,
            response: "Context is Updated successfully"
        });
    }
    catch(err){
        console.error(err?.response);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    addContext,
    updateContext
}