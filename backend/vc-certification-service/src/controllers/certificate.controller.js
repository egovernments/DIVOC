const constants = require('../configs/constants');
const utils = require("../utils/utils");
const sunbirdRegistryService = require('../services/sunbird.service')

async function createCertificate(req, res) {
    try {
        const entityType = req.params.entityType;
        console.log("EntityType: ", entityType);
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityType)
        res.status(200).json({
            message: "Successfully Inserted",
            certificateAddResponse: certificateAddResponse
        });
    } catch (err) {
        console.error(err);
        res.statusCode = err.response.status;
        return JSON.stringify(err.response.data);
    }
}

module.exports = {
    createCertificate
}
