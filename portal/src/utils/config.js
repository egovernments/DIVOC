import axios from "axios";
import React, {useEffect, useState} from "react";

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
    return maskString(input, APP_CONFIG.MASKED_DIGITS)
}

export function maskString(input, numberOfMaskDigit) {
    if (input && (typeof input === 'string' || input instanceof String)) {
        const maskRegex = new RegExp('\\w(?=\\w{' + numberOfMaskDigit + '})', 'g');
        return input.replace(maskRegex, "X");
    }
}
