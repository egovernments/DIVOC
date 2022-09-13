const CustomError = class {
    constructor(message, status) {
        this.message = message;
        this.status = status
    }

    error() {
        return {
            "response": {
                "data": {
                    "message": this.message
                },
                "status": this.status
            }
        };
    }
};

module.exports = {
    CustomError
}