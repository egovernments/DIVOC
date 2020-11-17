export class ApiServices {

    static async requestOtp(mobileNumber) {
        return sleep(2000);
    }

    static async login(mobileNumber, otp) {
        return sleep(3000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
