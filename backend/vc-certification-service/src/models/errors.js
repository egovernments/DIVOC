class CustomError extends Error {
    constructor (message, status) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
        this.status = status
    }
}


module.exports = {
    CustomError
}