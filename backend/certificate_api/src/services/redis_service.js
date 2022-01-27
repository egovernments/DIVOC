const redis = require("redis");
const {promisify} = require("util");
let redisClient;
let existsAsync;
let getAsync;
let redisKeyExpiry;
let isRedisEnabled;
function initRedis(config) {
  isRedisEnabled = config.REDIS_ENABLED;
  if(isRedisEnabled) {
    redisClient = redis.createClient(config.REDIS_URL);
    redisConnectionEventListeners({ conn: redisClient });
    existsAsync = promisify(redisClient.exists).bind(redisClient);
    getAsync = promisify(redisClient.get).bind(redisClient);
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
    console.log('Redis - Connection status: reconnecting');
  });
  conn.on('error', (err) => {
    console.error('Redis - Connection status: error ', { err });
  });
}
  
async function checkIfKeyExists(key) {
  if(isRedisEnabled && redisClient.connected) {
    return await existsAsync(key)
  } else {
    return false
  }
}

function storeKeyWithExpiry(key, value, expiry = redisKeyExpiry) {  
  if(isRedisEnabled && redisClient.connected) {
    redisClient.set(key, value, "EX", expiry)
  }
}

function deleteKey(key) {
  if(isRedisEnabled && redisClient.connected) {
    redisClient.del(key)
  }
}

async function getValueAsync(key) {
  return await getAsync(key);
}

module.exports = {
  initRedis,
  checkIfKeyExists,
  getValueAsync,
  storeKeyWithExpiry,
  deleteKey
}