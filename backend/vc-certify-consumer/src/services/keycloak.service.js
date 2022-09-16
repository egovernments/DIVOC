const jwt = require("jsonwebtoken");

const getOsOwner = (bearerToken) => {
    const token = bearerToken.split(" ")[1];
    const decodedPayload = jwt.decode(token);
    return decodedPayload["sub"];
}

module.exports = {
    getOsOwner
};
