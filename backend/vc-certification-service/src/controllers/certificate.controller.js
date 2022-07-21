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
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function getCertificate(req, res) {
    try {
        const entityName = req.params.entityName;
        const certificateId = req.params.certificateId;
        const {data} = await sunbirdRegistryService.getCertificate(entityName, certificateId, req.headers);
        data.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err
        });
    }
}

module.exports = {
    createCertificate,
    getCertificate
}
