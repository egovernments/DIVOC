const jwt = require('jsonwebtoken');
const config = require('../../configs/config');
const {KeycloakFactory} = require("./keycloak_service");

async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, config.JWT_PUBLIC_KEY);
        return decoded;
    } catch (err) {
        throw err
    }
}

async function verifyKeycloakToken(bearerToken) {
    try {
        const token = bearerToken.split(" ")[1];
        const publicKey = await KeycloakFactory.getPublicKey();
        const decoded = jwt.verify(token, "-----BEGIN PUBLIC KEY-----\n"+publicKey+"\n-----END PUBLIC KEY-----\n");
        return decoded;
    } catch (err) {
        throw err
    }
}

module.exports = {
    verifyToken,
    verifyKeycloakToken
};