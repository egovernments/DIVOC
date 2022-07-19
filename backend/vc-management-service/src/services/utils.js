
const FormData = require('form-data');

function getFormData(req) {
    const formData = new FormData();
    formData.append('files', req.file.buffer, {filename: req.file.originalname});
    return formData;
}

function isValid(val) {
    const regex = /^[a-zA-Z]*$/
    return val !== "" && regex.test(val);
}

module.exports = {
    getFormData,
    isValid
}