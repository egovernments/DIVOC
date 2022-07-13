function validateCreateSchemaRequestBody(requestBody) {
    return requestBody.name && requestBody.schema && (Object.keys(requestBody.schema).length !== 0);
}

module.exports = {
    validateCreateSchemaRequestBody
}