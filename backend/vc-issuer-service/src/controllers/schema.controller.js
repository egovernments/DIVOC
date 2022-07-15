const sunbirdRegistryService = require('../services/sunbird.service')

async function createSchema(req, res) {
    try {
        const schemaAddResponse = await sunbirdRegistryService.createSchema(req.body);
        res.status(200).json({
            message: "Successfully Inserted Schema",
            schemaAddResponse: schemaAddResponse
        });
    } catch (err) {
        console.error(err);
        res.statu(500).json({
            message: err
        });
    }
}

module.exports = {
    createSchema
}
