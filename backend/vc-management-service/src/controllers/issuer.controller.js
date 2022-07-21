const sunbirdRegistryService = require('../services/sunbird.service')
const utils = require('../utils/utils')

async function createIssuer(req, res) {
    try {
        const isValidUserId = utils.isValidUserId(req.body?.accountDetails?.userId)
        if (isValidUserId) {
            const issuerAddResponse = await sunbirdRegistryService.createIssuer(req.body);
            res.status(200).json({
                message: "Successfully created Issuer",
                issuerAddResponse: issuerAddResponse
            });
            return;
        }
        res.status(400).json({
            message: "Invalid userId. It must start with an alphabet or a number and can only contain .-_@"
        })
    } catch (err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data
        });
    }
}

module.exports = {
    createIssuer
}
