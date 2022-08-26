const jwt = require("jsonwebtoken");
async function addRoleIfNotPresent(req, res, next) {
    let schema = JSON.parse(req.body.schema);
    if(schema._osConfig.roles === undefined || schema._osConfig.roles === null) {
        schema._osConfig.roles = [];
    }
    const header = req.header("Authorization");
    const token = header.split(" ")[1];
    const decodedPayload = jwt.decode(token);
    if(schema._osConfig.roles.indexOf(decodedPayload.preferred_username + "-realm-role")  < 0)
        schema._osConfig.roles.push(decodedPayload.preferred_username + "-realm-role");
    req.body.schema = JSON.stringify(schema);
    next();
}

module.exports = {
    addRoleIfNotPresent
}