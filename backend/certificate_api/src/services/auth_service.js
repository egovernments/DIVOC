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

module.exports = {
    verifyToken
};