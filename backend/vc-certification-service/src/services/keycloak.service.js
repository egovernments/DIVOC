const certifyConstants = require('../configs/constants');
const axios = require('axios');
const config = require('../configs/config');

const KeycloakFactory = (function(){
    async function SingletonClass() {
        try {
            console.log("Fetching keycloak token");
            const data = await axios.get(`${config.KEYCLOAK_URL}/auth/realms/${config.KEYCLOAK_REALM}`)
                .then(res => res.data);
            console.log(data)
            return {
                keycloakPublicToken: data.public_key
            }
        } catch (e) {
            console.error(e)
            process.exit(1)
        }
    }
    var instance;
    return {
        getInstance: async function () {
            if (instance == null) {
                instance = await SingletonClass();
                instance.constructor = null;
            }
            return instance;
        },
        getPublicKey : async function () {
            let obj = await this.getInstance();
            return obj.keycloakPublicToken;
        }
    };
})();

const getAdminToken = () => {

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', certifyConstants.SUNBIRD_SSO_CLIENT);
    params.append('client_secret', certifyConstants.SUNBIRD_SSO_ADMIN_CLIENT_SECRET);

    return axios.post(`${config.KEYCLOAK_URL}/auth/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`, params, {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
        .then(async res => res.data.access_token)
        .catch(err => {
            console.error("Error : ", err);
            throw err;
        })
}


module.exports = {
    KeycloakFactory,
    getAdminToken
};
