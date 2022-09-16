const axios = require("axios");
const sunbirdRegistryService = require("./sunbird.service");
const getTenantWebhookDetails = async function (osOwner, token) {
    const tenantFilter = {
        "filters": {
            "osOwner": {
                "eq": '["' + osOwner + '"]'
            }
        },
        "limit": 1,
        "offset": 0
    };
    let tenantResponse = await sunbirdRegistryService.searchCertificate("Tenant", tenantFilter, token);
    return {
        webhookUrl : tenantResponse[0]?.callbackUrl,
        webhookToken: tenantResponse[0]?.callbackToken
    }
}

const pushToWebhook = function (token, url, payload) {
    return axios.post(url, payload, {"headers": {"Authorization": token}})
        .then(res => console.log(res))
        .catch(err => console.log(err));
}

module.exports = {
    getTenantWebhookDetails,
    pushToWebhook
}