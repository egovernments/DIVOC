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


module.exports = {
    KeycloakFactory,
    createNewRole,
    assignNewRole,
    getUserInfo,
    getRoleInfo
};
