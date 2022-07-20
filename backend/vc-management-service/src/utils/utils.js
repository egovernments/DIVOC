const FormData = require('form-data');

function validateUserId(userId) {
    let userIdRegex = new RegExp("^[a-zA-Z0-9][a-zA-Z0-9.-_@]+$")
    if (!userIdRegex.test(userId)) {
        throw "Invalid userId. It must start with an alphabet or a number and can only contain .-_@";
    }
}

function getFormData(req) {
    const formData = new FormData();
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
    return formData;
}

function isValidIssuerName(val) {
    const regex = /^[a-zA-Z]*$/
    return val !== "" && regex.test(val);
}

module.exports = {
    validateUserId,
    getFormData,
    isValidIssuerName
}