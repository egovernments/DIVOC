const jwt = require('jsonwebtoken');
const {KeycloakFactory} = require("../services/keycloak.service");

async function verifyKeycloakToken(bearerToken) {
    try {
        const token = bearerToken.split(" ")[1];
        const publicKey = await KeycloakFactory.getPublicKey();
        return jwt.verify(token, "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----\n", {}, () => {
        });
    } catch (err) {
        throw err
    }
}
async function tokenValidationMiddleware(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(403).send({error: "Access Denied. No Token Provided"});
    try {
        const verified = await verifyKeycloakToken(token);
        req.user = verified;
        next();
    } catch (err) {
        console.error("Error in verifying token: ", err);
        res.status(401).send({error: "auth failed, check bearer token"});
    }
}
async function roleAuthorizer(req, res, next){
    const bearerToken = req.header("Authorization");
    if (!bearerToken) return res.status(403).send({error: "Access Denied. No Token Provided"});
    try {
        const token = bearerToken.split(" ")[1];
        const decodedPayload = jwt.decode(token);
        const payloadRoles = decodedPayload.resource_access["admin-api"]?.roles;
        const payloadVcRoles = decodedPayload.resource_access["manage"].roles;
        if(payloadRoles.includes("api") && payloadVcRoles.includes("vc-manage")){
            next();
        }else{
            res.status(403).send({error: "role not authorized"});
        }
    } catch (err) {
        console.error("Error in verifying token: ", err);
        res.status(401).send({error: "auth failed, check bearer token"});
    }
}
module.exports = {
    tokenValidationMiddleware,
    roleAuthorizer
};