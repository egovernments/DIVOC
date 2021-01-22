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

function storeKeyWithExpiry(key, value, expiry = config.REDIS_KEY_EXPIRE) {
  client.set(key, value, "EX", expiry)
}

function deleteKey(key) {
  client.del(key)
}
module.exports = {
  checkIfKeyExists,
  storeKeyWithExpiry,
  deleteKey
};
