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

module.exports = function (req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(403).send({error: "Access Denied!, no token entered"});
    try {
        const verified = verifyKeycloakToken(token);
        req.user = verified;
        console.log("token is verified");
        next();
    } catch (err) {
        console.error("Error in verifying token: ", err);
        res.status(401).send({error: "auth failed, check bearer token"});
    }
};
