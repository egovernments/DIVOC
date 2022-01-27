const mockRedis = require('redis-mock');
const redis = require('redis');
const util = require('util');

const config = require('../configs/config');
jest.mock('redis', () => jest.requireActual('redis-mock'));
var mockExistsFun = new Function();
jest.spyOn(util, 'promisify').mockReturnValueOnce(mockExistsFun)
const mockClient = mockRedis.createClient(config.REDIS_URL);
const redisService = require('../src/services/redis_service');

beforeEach(async() => {
    const mock = jest.spyOn(redis, 'createClient');
    mock.mockImplementation(() => mockClient);
    console.log = jest.fn();
});

test('should initialize redis', async() => {
    redisService.initRedis(config);
    expect(redis.createClient).toHaveBeenCalled();
});

test('should call get stored value from redis', async(done) => {
    try {
        await redisService.getValueAsync('abc');
        expect(util.promisify).toHaveBeenCalledWith(mockClient.get);
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

test('should call delete function of redis when trying to delete value', async(done) => {
    try {
        jest.spyOn(mockClient, 'del');
        redisService.deleteKey('abc');
        expect(mockClient.del).toHaveBeenCalled();
        done();
    }
    catch(err) {
        done(err);
    }
});

test('should return false from checkIfKeyExists function when redis is disabled', async(done) => {
    try {
        const config1 = {
            REDIS_ENABLED: false
        }
        redisService.initRedis(config1);
        const exists = await redisService.checkIfKeyExists('abc');
        expect(exists).toEqual(false);
        done();
    }
    catch(err) {
        done(err);
    }
});