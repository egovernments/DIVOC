import axios from "axios";

export function getNotificationTemplates() {
    const data = {
        "flagKey": "notification_templates"
    };
    return axios
        .post("/config/api/v1/evaluation", data)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err)
        })
        .then((result) => {
            return result["variantAttachment"]
        })
}

export const APP_CONFIG = Object.freeze({
    MASKED_DIGITS: 4
})

export function maskNationalId(input) {
    if (input && (typeof input === 'string' || input instanceof String)) {
        const maskRegex = new RegExp('\\d(?=\\d{' +  APP_CONFIG.MASKED_DIGITS + '})', 'g');
        return input.replace(maskRegex, "X");
    }
}
