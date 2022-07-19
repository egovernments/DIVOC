const sunbirdRegistryService = require('../services/sunbird.service');
const FormData = require('form-data');

async function uploadTemplate(req, res) {
    try {
        const formData = getFormData(req);
        const uploadTemplateResponse = await sunbirdRegistryService.uploadTemplate(
            formData,
            req.params.issuer,
            req.header('Authorization')
        );
        console.log('Successfully uploaded template');
        res.status(200).json({
            message: "Successfully uploaded template",
            uploadTemplateResponse: uploadTemplateResponse
        });
    } catch(err) {
        console.error(err);
        res.statusCode = err.response.status;
        return JSON.stringify(err.response.data);
    }
}

function getFormData(req) {
    const formData = new FormData();
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
    return formData;
}

module.exports = {
    uploadTemplate
}