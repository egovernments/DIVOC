const constants = require('../../configs/constants');
const utils = require("../services/utils");
const schemaService = require("../services/schema_service");
const sunbirdRegistryService = require('../services/sunbird_service')

async function createCertificate(req, res) {
    try {
        const entityType = req.url.replace(constants.BASE_PATH + "v1/certify/", "").split("?")[0];
        console.log(entityType);
        let requestBody = await utils.getRequestBody(req)
        console.log(requestBody);
        //TODO: validate incoming auth token
        if (Object.keys(requestBody).length === 0) {
            res.statusCode = 400
            return {
                "message": "Invalid input",
                "status": "Unsuccessful"
            }
        }
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(requestBody, entityType)
        res.statusCode = 200;
        return JSON.stringify(certificateAddResponse)
    } catch (err) {
        console.error(err);
        res.statusCode = err.response.status;
        return JSON.stringify(err.response.data);
    }
}

module.exports = {
    createCertificate
}