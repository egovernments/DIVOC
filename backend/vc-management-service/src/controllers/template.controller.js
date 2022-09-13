const sunbirdRegistryService = require('../services/sunbird.service');
const {getFormData, isValidTenantName} = require('../utils/utils');

async function uploadTemplate(req, res) {
    try {
        const formData = getFormData(req);
        const isValidTenant = isValidTenantName(req.params.tenant);
        if(isValidTenant) {
            const uploadTemplateResponse = await sunbirdRegistryService.uploadTemplate(
                formData,
                req.params.tenant,
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
            message: "tenant invalid"
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