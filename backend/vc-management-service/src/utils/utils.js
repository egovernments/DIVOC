const FormData = require('form-data');

function isValidUserId(userId) {
    let userIdRegex = new RegExp("^\\S+@\\S+\\.\\S+$")
    return userId!=="" && userIdRegex.test(userId)
}

function getFormData(req) {
    const formData = new FormData();
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
    return formData;
}

function isValidTenantName(val) {
    const regex = /^[a-zA-Z]*$/
    return val !== "" && regex.test(val);
}

module.exports = {
    isValidUserId,
    getFormData,
    isValidTenantName
}