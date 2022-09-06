const sunbirdRegistryService = require('../src/services/sunbird.service');
const contextController = require('../src/controllers/context.controller');
const contants = require('../src/configs/constants');

jest.mock('../src/configs/constants', () => {
    return {
        MINIO_BUCKET_NAME: 'context',
        MINIO_CONTEXT_URL: 'localhost:8081/api/v1/ContextURL'
    }
})
jest.mock('../src/services/sunbird.service', () => {
    return {
        createEntity: jest.fn()
    }
})

test('should add context entry in registry', async() => {
    const req = {
        baseUrl: '/vc-management/v1/context',
        file: {
            buffer: '123',
            originalname: 'context.json'
        },
        header: jest.fn().mockReturnValue('1')
    }
    const res = {
        send: function(){},
        json: function(d) {
        },
        status: function(s) {
            this.statusCode = s;
            return this;
        }
    };
    let minioClient = {
        putObject: jest.fn()
    }
    await contextController.addContext(req, res, minioClient);
    expect(minioClient.putObject).toHaveBeenCalledWith('context', '/vc-management/v1/context/context.json', '123');
    expect(sunbirdRegistryService.createEntity).toHaveBeenCalledWith('localhost:8081/api/v1/ContextURL', {url:'/vc-management/v1/context/context.json'}, '1');
});