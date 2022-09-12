const constants = require('../configs/constants');
const config = require('../configs/config');
const sunbirdRegistryService = require('../services/sunbird.service');
const redisService = require('../services/redis.service');
const {getAdminToken} = require('../services/keycloak.service');

async function addContext(req, res, minioClient) {
    try {
        const filename = req.baseUrl + "/" + Date.now() +"-" + req.file.originalname;
        const file = req.file.buffer;
        let fileStr = file.toString();
        fileStr = fileStr.replaceAll('\n', '');
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
    try{
        const filename = req.baseUrl + "/" + Date.now()+ "-"+ req.file.originalname;
        const file = req.file.buffer;
        let fileStr = file.toString();
        fileStr = fileStr.replaceAll('\n', '');
        const osid = req.params.osid;
        JSON.parse(fileStr);
        let url = constants.MINIO_CONTEXT_URL + "/" + osid
        const getContextResp = await sunbirdRegistryService.getEntity(url,req.header('Authorization'));
        console.log("getContextResp: " ,getContextResp);
        await minioClient.putObject(constants.MINIO_BUCKET_NAME, filename, file);
        
        const updateContextResp = await sunbirdRegistryService.updateEntity(url, {url: filename}, req.header('Authorization'));
        console.log("updateContextResp: ",updateContextResp);
        if(config.REDIS_ENABLED) {
            redisService.storeKeyWithExpiry(osid, fileStr);
        }
        if(filename !== getContextResp.url){
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
    const adminToken = await getAdminToken();
    const url = (await sunbirdRegistryService.getEntity(constants.MINIO_CONTEXT_URL + "/" + req.params.osid, 'Bearer '+ adminToken)).url;
    const value = await minioClient.getObject(constants.MINIO_BUCKET_NAME, url);
    let data = '';
    value.on('data', function (chunk) {
        data += chunk;
    });
    value.on('end', function (chunk) {
        if (chunk !== undefined)
            data += chunk;
        res.status(200).set({ 'Content-Type': 'application/ld+json'}).json(JSON.parse(data.toString()));
        redisService.storeKeyWithExpiry(req.params.osid, data.toString());
    });
    return;
}


async function deleteContext(req, res, minioClient) {
    try {
        const osid = req.params.osid;
        const token = req.header("Authorization");
        let url = constants.MINIO_CONTEXT_URL + "/" + osid;

        const getContextResp = await sunbirdRegistryService.getEntity(url, token);
        await minioClient.removeObject(constants.MINIO_BUCKET_NAME, getContextResp.url);

        if(config.REDIS_ENABLED) {
            redisService.deleteKey(osid);
        }
        const deleteContextResponse = await sunbirdRegistryService.deleteEntity(url, token);

        res.status(200).json({
            message: "Deleted Context",
            Response: deleteContextResponse
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
    addContext,
    updateContext,
    getContext,
    deleteContext
}