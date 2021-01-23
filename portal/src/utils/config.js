import axios from "axios";

export function getNotificationTemplates() {
    const data = {
        "flagKey": "notification_templates"
    };
    return axios
        .post("https://divoc.xiv.in/config/api/v1/evaluation", data)
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
