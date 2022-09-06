const redis = require("redis");
let client;

async function initRedis(config) {
  client = redis.createClient(config.REDIS_URL);
  client.on("error", function (error) {
    console.error(error);
  });
}

function storeKeyWithExpiry(key, value) {
  client.set(key, value);
}

module.exports = {
  storeKeyWithExpiry,
  initRedis
};
