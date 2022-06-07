const redis = require("redis");
const {promisify} = require('util');

let client;
let existsAsync;
let redisKeyExpiry;
let isRedisEnabled;

async function initRedis(REDIS_ENABLED, REDIS_URL, REDIS_KEY_EXPIRE) {
    isRedisEnabled = REDIS_ENABLED;
    if(isRedisEnabled) {
      client = redis.createClient(REDIS_URL);
      redisConnectionEventListeners({ conn: client });
      existsAsync = promisify(client.exists).bind(client);
    }
    redisKeyExpiry = REDIS_KEY_EXPIRE;
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

function storeKeyWithExpiry(key, value, expiry = redisKeyExpiry) {
  if(isRedisEnabled && client.connected) {
    client.set(key, value, "EX", expiry);
  }
}

async function checkIfKeyExists(key) {
  if(isRedisEnabled && client.connected) {
    return existsAsync(key)
  } else {
    return false
  }
}

module.exports = {
    storeKeyWithExpiry,
    checkIfKeyExists,
    initRedis
};
  