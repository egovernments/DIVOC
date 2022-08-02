const axios = require("axios");
const constants = require('../configs/constants');

const addTransaction = (postCreateEntityMessage, entityType) => {
    return axios.post(`${constants.SUNBIRD_TRANSACTION_URL}${entityType}/invite`,postCreateEntityMessage)
    .catch(error => {
        console.error("Error in adding transaction within sunbird-rc", error);
        throw error;
    })
}

function createTransactionRequest (postCreateEntityMessage) {
    const request = {
        "transactionId" : postCreateEntityMessage.transactionId,
        "entityOsid" : postCreateEntityMessage.osid,
        "entityType" : postCreateEntityMessage.entityType,
        "status" : postCreateEntityMessage.status,
        "message" : postCreateEntityMessage.message,
        "userId" : postCreateEntityMessage.userId
      }
    return request;
}

module.exports={
    addTransaction,
    createTransactionRequest
}