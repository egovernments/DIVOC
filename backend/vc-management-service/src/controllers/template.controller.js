const sunbirdRegistryService = require('../services/sunbird.service');
const {getFormData, isValidIssuerName} = require('../utils/utils');

async function uploadTemplate(req, res) {
    try {
        const formData = getFormData(req);
        const isValidIssuer = isValidIssuerName(req.params.issuer);
        if(isValidIssuer) {
            const uploadTemplateResponse = await sunbirdRegistryService.uploadTemplate(
                formData,
                req.params.issuer,
                req.header('Authorization')
            );
            console.log('Successfully uploaded template');
            res.status(200).json({
                message: uploadTemplateResponse.message,
                uploadTemplateResponse: uploadTemplateResponse
            });
            return;
        }
        res.status(400).json({
            message: "Issuer invalid"
        })
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data || err
        });
    }
}


module.exports = {
    uploadTemplate
}