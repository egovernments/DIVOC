const mockRedis = require("redis-mock");
const redis = require('redis');
const config = require('../configs/config');
const redisService = require('../src/services/redis_service');
jest.mock('redis', () => jest.requireActual('redis-mock'));
const mockClient = mockRedis.createClient(config.REDIS_URL);

jest.setTimeout(3000);

beforeEach(async() => {
    const mock = jest.spyOn(redis, 'createClient');
    mock.mockImplementation(() => mockClient);
    // console.log = jest.fn();
});

test('should initialize redis', async() => {
    await redisService.initRedis(config);
    expect(redis.createClient).toHaveBeenCalled();
});

test('should call get stored value from redis', async(done) => {
    try {
        const ans = await redisService.getValueAsync('abc');
        // expect(ans).toEqual('xyz')
        done();
    }
    catch (err) {
        done(err);
    }
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

