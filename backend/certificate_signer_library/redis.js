const redis = require("redis");
const {promisify} = require("util");
let client;
let existsAsync;
let redisKeyExpiry;
let isRedisEnabled;

async function initRedis(config) {
  isRedisEnabled = config.REDIS_ENABLED;
  if(isRedisEnabled) {
    client = redis.createClient(config.REDIS_URL);
    client.auth(config.REDIS_PASSWORD);
    redisConnectionEventListeners({ conn: client });
    existsAsync = promisify(client.exists).bind(client);
  }
  redisKeyExpiry = config.REDIS_KEY_EXPIRE;
}

function redisConnectionEventListeners({ conn }) {
  conn.on('connect', () => {
    console.log('Redis - Connection status: connected');
  });
  conn.on('end', () => {
    console.log('Redis - Connection status: disconnected');
  });
  conn.on('reconnecting', () => {
    // console.log('Redis - Connection status: reconnecting');
  });
  conn.on('error', (err) => {
      console.error('Redis - Connection status: error ', { err });
  });
}

async function checkIfKeyExists(key) {
  if(isRedisEnabled && client.connected) {
    return existsAsync(key)
  } else {
    return false
  }
}

function storeKeyWithExpiry(key, value, expiry = redisKeyExpiry) {
  if(isRedisEnabled && client.connected) {
    client.set(key, value, "EX", expiry)
  }
}

function deleteKey(key) {
  if(isRedisEnabled && client.connected) {
    client.del(key)
  }
}

module.exports = {
  checkIfKeyExists,
  storeKeyWithExpiry,
  deleteKey,
  initRedis
};
