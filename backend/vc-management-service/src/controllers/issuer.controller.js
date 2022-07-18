const sunbirdRegistryService = require('../services/sunbird.service')

async function createIssuer(req, res) {
    try {
        const issuerAddResponse = await sunbirdRegistryService.createIssuer(req.body);
        res.status(200).json({
            message: "Successfully created Issuer",
            issuerAddResponse: issuerAddResponse
        });
    } catch (err) {
        console.error(err);
        res.statusCode = err.response.status;
        return JSON.stringify(err.response.data);
    }
}

module.exports = {
    createIssuer
}
