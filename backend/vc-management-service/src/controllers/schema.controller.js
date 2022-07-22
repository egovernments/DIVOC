const sunbirdRegistryService = require('../services/sunbird.service')

async function createSchema(req, res) {
    try {
        const token = req.header("Authorization");
        const schemaAddResponse = await sunbirdRegistryService.createSchema(req.body, token);
        res.status(200).json({
            message: "Successfully created Schema",
            schemaAddResponse: schemaAddResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

async function updateSchema(req, res) {
    try {
        const schemaId = req.params.schemaId;
        const token = req.header("Authorization");
        const schemaUpdateResponse = await sunbirdRegistryService.updateSchema(req.body, token, schemaId);
        res.status(200).json({
            message: "Successfully updated Schema",
            schemaUpdateResponse: schemaUpdateResponse
        });
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    createSchema,
    updateSchema
}
