const {smsAuthKey} = require('./config/keys');
const config = require('./config/config');
const axios = require('axios');

async function sendSMS(jsonMessage) {
    const mobileNumber = jsonMessage.recipient.contact;
    const vaccineName = jsonMessage.vaccination.name;
    const recipientName = jsonMessage.recipient.name;
    if (mobileNumber) {
        const message = `${recipientName}, your ${vaccineName} vaccine certificate can be viewed and downloaded at: https://divoc.xiv.in/certificate/ `;
        console.log("Sending SMS to:" + mobileNumber + message);
        const body = {
            "sender": "SOCKET",
            "route": "4",
            "country": "91",
            "unicode": "1",
            "sms": [{"message": message, "to": [mobileNumber]}]
        };

        const headers = {
            headers: {
                "authkey": smsAuthKey,
                "Content-Type": "application/json",
            },
        };
        return axios.post(
            config.SMS_GATEWAY_URL,
            body,
            headers
        ).then(res => {
            console.log(`statusCode: ${res.status}`);
            console.log(res.data)
            return res.data;
        }).catch(error => {
            console.log(error)
        })
    }
}

module.exports = {
    sendSMS
};

