async function rolePresentValidatorMiddleware(req, res, next) {
    const schema = JSON.parse(req.body.schema);
    if(schema._osConfig.roles === undefined || schema._osConfig.roles === null || schema._osConfig.roles.length === 0) {
        res.status(400).send({error: "Bad Request. Roles property not present in request body"});
        return;
    }
    next();
}

module.exports = {
    rolePresentValidatorMiddleware
}