const redis = require("redis");
const {promisify} = require("util");
let client;
let existsAsync;
let redisKeyExpiry;

async function initRedis(config) {
  client = redis.createClient(config.REDIS_URL);
  client.on("error", function (error) {
    console.error(error);
  });
  existsAsync = promisify(client.exists).bind(client);
  redisKeyExpiry = config.REDIS_KEY_EXPIRE;
}

async function checkIfKeyExists(key) {
  return existsAsync(key)
}

function storeKeyWithExpiry(key, value, expiry = redisKeyExpiry) {
  client.set(key, value, "EX", expiry)
}

function deleteKey(key) {
  client.del(key)
}
module.exports = {
  checkIfKeyExists,
  storeKeyWithExpiry,
  deleteKey,
  initRedis
};
