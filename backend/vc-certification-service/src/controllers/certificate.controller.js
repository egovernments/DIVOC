const sunbirdRegistryService = require('../services/sunbird.service')

async function createCertificate(req, res) {
    try {
        const entityType = req.params.entityType;
        const token = req.header("Authorization");
        console.log("EntityType: ", entityType);
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityType, token)
        console.log("certificateAddResponse: ", certificateAddResponse);
        res.status(200).json({
            message: "Successfully Certified",
            certificateAddResponse: certificateAddResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err
        });
    }
}

module.exports = {
    createCertificate
}
