const axios = require('axios');
const config = require('../configs/config');
const constants = require('../configs/constants');
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

const createNewRole = async (roleName, token) => {
    const roleRepresentation = {
        "name": roleName
    }
    const reqConfig = {
        headers: {
            Authorization: token
        }
    }
    return axios.post(`${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/roles`, roleRepresentation, reqConfig).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const assignNewRole = async (roles, userId, token) => {
    const reqConfig = {
        headers: {
            Authorization: token
        }
    }
    return axios.post(`${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`, roles, reqConfig).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const getUserInfo = async (userName, token) => {
    const reqConfig = {
        headers: {
            Authorization: token
        }
    }
    return axios.get(`${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/users?username=${userName}`, reqConfig).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const getRoleInfo = async (roleName, token) => {
    const reqConfig = {
        headers: {
            Authorization: token
        }
    }
    return axios.get(`${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/roles/${roleName}`, reqConfig).then(res =>
        res.data
    ).catch(error => {
        console.error(error);
        throw error;
    });
}

const getAdminToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', constants.SUNBIRD_SSO_CLIENT);
    params.append('client_secret', constants.SUNBIRD_SSO_ADMIN_CLIENT_SECRET);

    const newtoken = await getToken(params);
    return newtoken.access_token;
}

const generateUserToken = async (userId) => {

    const adminToken = await getAdminToken();

    if (adminToken) {
        const params = new URLSearchParams();
        params.append('grant_type', constants.KEYCLOCK_GRANT_TYPE_TOKEN_EXCHANGE);
        params.append('client_id', constants.SUNBIRD_REGISTRY_FRONTEND_CLIENT);
        params.append('subject_token', adminToken);
        params.append('requested_token_type', constants.KEYCLOCK_TOKEN_TYPE_REFRESH_TOKEN);
        params.append('audience', constants.SUNBIRD_REGISTRY_FRONTEND_CLIENT);
        params.append('requested_subject', userId);

        const newtoken = await getToken(params);
        return newtoken;
    }
}

const getToken = (params) => {
    return axios.post(`${config.KEYCLOAK_URL}/auth/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`, params, {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
    .then(async res => res.data)
    .catch(err => {
        console.error("Error : ", err);
        throw err;
    })
}

module.exports = {
    KeycloakFactory,
    createNewRole,
    assignNewRole,
    getUserInfo,
    getRoleInfo,
    getAdminToken,
    generateUserToken
};
