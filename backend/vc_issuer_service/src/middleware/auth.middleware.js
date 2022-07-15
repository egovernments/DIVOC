const jwt = require('jsonwebtoken');
const customAxios = require('../utils/axios.custom');
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
    if (!token) return res.status(400).send({error: "Access Denied!, no token entered"});
    try {
        const verified = verifyKeycloakToken(token);
        req.user = verified;
        console.log("Verified: ", verified);
        customAxios.interceptors.request.use(
            (config) => {
                config.headers["Authorization"] = token;
                return config;
            },
            (error) => {console.log("Within interceptor:", error);}
        );
        next();
    } catch (err) {
        console.log("Error in verifying token: ", err);
        res.status(400).send({error: "auth failed, check bearer token"});
    }
};
