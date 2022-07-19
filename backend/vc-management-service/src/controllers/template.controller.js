const sunbirdRegistryService = require('../services/sunbird.service');
const {getFormData, isValid} = require('../services/utils');

async function uploadTemplate(req, res) {
    try {
        const formData = getFormData(req);
        const isValidIssuer = isValid(req.params.issuer);
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
        res.status(500).json({
            message: "Issuer invalid"
        })
    } catch(err) {
        console.error(err);
        res.status(err?.response?.status || 500).json({
            message: err?.message || err
        });
    }
}


module.exports = {
    uploadTemplate
}