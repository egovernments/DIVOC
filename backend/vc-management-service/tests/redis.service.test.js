const mockRedis = require('redis-mock');
const redis = require('redis');
const util = require('util')
var mockExistsFun = new Function();
jest.spyOn(util, 'promisify').mockReturnValueOnce(mockExistsFun)
const config = {
    REDIS_URL: "redis://redis:6379",
    REDIS_KEY_EXPIRE: 172800,
    REDIS_ENABLED: true
};

const mockClient = mockRedis.createClient(config.REDIS_URL);
const redisService = require('../src/services/redis.service');

beforeEach(async() => {
    const mock = jest.spyOn(redis, 'createClient');
    mock.mockImplementation(() => mockClient);
    console.log = jest.fn();
    console.error = jest.fn();
});

test('should initialize redis', async() => {
    redisService.initRedis(config);
    expect(redis.createClient).toHaveBeenCalled();
});

test('should call set in redis when adding a value', () => {
    jest.spyOn(mockClient, 'set');
    redisService.storeKeyWithExpiry('abc', 'xyz');
    expect(mockClient.set).toHaveBeenCalledWith('abc', 'xyz');
});

test('should call get stored value from redis', async(done) => {
    try {
        await redisService.getKey('abc');
        expect(util.promisify).toHaveBeenCalledWith(mockClient.get);
        done();
    }
    catch (err) {
        done(err);
    }
});