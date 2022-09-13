const truncateShard = (osId) => {
    return osId?.substring(2);
}

module.exports = {
    truncateShard
}