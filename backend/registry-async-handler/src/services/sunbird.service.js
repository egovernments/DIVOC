const axios = require("axios");
const config = require('../configs/config');
const constants = require('../configs/constants');

const addTransaction = (postCreateEntityMessage, entityType) => {
    return axios.post(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}/invite`,postCreateEntityMessage)
    .catch(error => {
        console.error("Error in adding transaction within sunbird-rc", error);
        throw error;
    })
}

module.exports={
    addTransaction
}