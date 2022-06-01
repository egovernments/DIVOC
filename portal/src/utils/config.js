import {CONSTANTS} from "./constants";

export function getNotificationTemplates(axiosInstance) {
    return axiosInstance.current.get(`/divoc/admin/api/v1/config/${CONSTANTS.NOTIFICATION_TEMPLATES_KEY}`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err)
        })
}
