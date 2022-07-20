function validateUserId(userId) {
    let userIdRegex = new RegExp("^[a-zA-Z0-9][a-zA-Z0-9.-_@]+$")
    if (!userIdRegex.test(userId)) {
        throw "Invalid userId. It must start with an alphabet or a number and can only contain .-_@";
    }
}

module.exports = {
    validateUserId
}