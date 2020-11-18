const BASE_URL = "https://divoc.xiv.in/divoc/api/v1"
const AUTHORIZE = BASE_URL + "/authorize"
const CONFIGURATION = BASE_URL + "/divoc/configuration"

export class ApiServices {

    static async requestOtp(mobileNumber) {
        return sleep(2000)
        /*const payload = {mobile: mobileNumber, token2fa: "1231"}
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'accept': 'application/json', 'Accept': '/'},
            body: JSON.stringify(payload)
        };
        return fetch(AUTHORIZE, requestOptions)
            .then(response => {
                return response.json()
            })*/
    }

    static async login(mobileNumber, otp) {
        await sleep(2000)
        return {
            refreshToken: "234klj23lkj.asklsadf",
            token: "123456789923234234"
        }
        /*const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'accept': 'application/json'},
            body: JSON.stringify({mobile: mobileNumber, token2fa: otp})
        };
        return fetch(AUTHORIZE, requestOptions)
            .then(response => response.json())*/
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
