const sunbirdRegistryService = require('../services/sunbird.service')

async function createCertificate(req, res) {
    try {
        const entityType = req.params.entityType;
        const token = req.header("Authorization");
        console.log("EntityType: ", entityType);
        const certificateAddResponse = await sunbirdRegistryService.createCertificate(req.body, entityType, token)
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

async function getCertificate(req, res) {
    try {
        const entityName = req.params.entityName;
        const certificateId = req.params.certificateId;
        const outputType = req.header("Accept");
        const token = req.header("Authorization");
        const certificateDownloadResponse = await sunbirdRegistryService.getCertificate(entityName, certificateId, outputType, token);
        res.setHeader("content-type", outputType);
        res.status(200).send(certificateDownloadResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err
        });
    }
}

module.exports = {
    createCertificate,
    getCertificate
}
