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

module.exports = {
    createSchema
}
