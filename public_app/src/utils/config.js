import axios from "axios";

export function getCertificateLabels(country = null) {
    const data = {
        "entityContext": {
            "country": country
        },
        "flagKey": "certificate-labels"
    }
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
