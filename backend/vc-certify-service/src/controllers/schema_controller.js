const constants = require('../../configs/constants');
const schemaService = require('../services/schema_service')
const sunbirdRegistryService = require('../services/sunbird_service')
const utils = require('../services/utils')

async function createSchema(req, res) {
    try {
        let requestBody = await utils.getRequestBody(req)
        //TODO: validate incoming auth token
        if (!schemaService.validateCreateSchemaRequestBody(requestBody)) {
            res.statusCode = 400
            return {
                "message": "Invalid input",
                "status": "Unsuccessful"
            }
        }
        const schemaAddResponse = await sunbirdRegistryService.createSchema(requestBody.name, JSON.stringify(requestBody.schema))
        res.statusCode = 200;
        return JSON.stringify(schemaAddResponse)
    } catch (err) {
        //TODO: change error handling for invalid tokens while verifying before passing request on to sb-registry
        console.error(err);
        res.statusCode = err.response.status;
        return JSON.stringify(err.response.data);
    }
}

module.exports = {
    createSchema
}