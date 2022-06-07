const mockRedis = require('redis-mock');
const redis = require('redis');
const util = require('util');

const config = {
    REDIS_URL: "redis://redis:6379",
    REDIS_KEY_EXPIRE: 172800,
    REDIS_ENABLED: true
};
jest.mock('redis', () => jest.requireActual('redis-mock'));
var mockExistsFun = new Function();
jest.spyOn(util, 'promisify').mockReturnValueOnce(mockExistsFun)
const mockClient = {
    set: jest.fn().mockImplementation(() => jest.fn()),
    del: jest.fn().mockImplementation(() => jest.fn()),
    on: jest.fn().mockImplementation(() => jest.fn()),
    connected: true
}
const redisService = require('../redis');

beforeEach(async() => {
    const mock = jest.spyOn(redis, 'createClient');
    mock.mockImplementation(() => mockClient);
});

test('should initialize redis', async() => {
    redisService.initRedis(config.REDIS_ENABLED, config.REDIS_URL, config.REDIS_KEY_EXPIRE);
    expect(redis.createClient).toHaveBeenCalled();
});

test('should call set in redis when adding a value', async(done) => {
    try {
        jest.spyOn(mockClient, 'set');
        redisService.storeKeyWithExpiry('abc', 'xyz', 10000);
        expect(mockClient.set).toHaveBeenCalledWith('abc', 'xyz', 'EX', 10000);
        done();
    }
    catch (err) {
        done(err);
    }
});

test('should check if key is already present in redis', async(done) => {
    try{
        await redisService.checkIfKeyExists('abc');
        expect(util.promisify).toHaveBeenCalledWith(mockClient.exists);
        done();
    }
    catch(err) {
        done(err)
    }
});

test('should return false from checkIfKeyExists function when redis is disabled', async(done) => {
    try {
        const config1 = {
            REDIS_URL: "redis://redis:6379",
            REDIS_KEY_EXPIRE: 172800,
            REDIS_ENABLED: false
        }
        redisService.initRedis(config1.REDIS_ENABLED, config1.REDIS_URL, config1.REDIS_KEY_EXPIRE);
        const exists = await redisService.checkIfKeyExists('abc');
        expect(exists).toEqual(false);
        done();
    }
    catch(err) {
        done(err);
    }
});