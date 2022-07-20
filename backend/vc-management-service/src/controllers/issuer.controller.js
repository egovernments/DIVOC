const sunbirdRegistryService = require('../services/sunbird.service')
const utils = require('../utils/utils')

async function createIssuer(req, res) {
    try {
        utils.validateUserId(req.body?.accountDetails?.userId);
        const issuerAddResponse = await sunbirdRegistryService.createIssuer(req.body);
        res.status(200).json({
            message: "Successfully created Issuer",
            issuerAddResponse: issuerAddResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err
        });
    }
}

module.exports = {
    createIssuer
}
