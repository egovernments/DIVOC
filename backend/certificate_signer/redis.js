const redis = require("redis");
const config = require('./config/config');
const {promisify} = require("util");
const client = redis.createClient(config.REDIS_URL);
const existsAsync = promisify(client.exists).bind(client);
client.on("error", function (error) {
  console.error(error);
});

async function checkIfKeyExists(key) {
  return existsAsync(key)
}

function storeKeyWithExpiry(key, value) {
  client.set(key, value, "EX", config.REDIS_KEY_EXPIRE, "NX")
}

module.exports = {
  checkIfKeyExists,
  storeKeyWithExpiry
};
