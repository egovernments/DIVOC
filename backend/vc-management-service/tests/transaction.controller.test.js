beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const sunbirdRegistryService = require('../src/services/sunbird.service');
const transactionController = require('../src/controllers/transaction.controller');
const { CustomError} = require('../src/models/error');

jest.mock('../src/services/sunbird.service', () => {
    const response = [{
        "transactionId": 'dummy',
        "certificateId": 'dummy',
        "entityType":    'dummy',
        "status":        'dummy'
    }];
    return {
        getTransaction: jest.fn().mockImplementation((a, b) => Promise.resolve(response))
    }
});

test('should get osid from transactionId', async () => {
    jest.resetModules();
    const req ={
        baseUrl:'/vc-management/v1/transaction',
        params: {
            transactionId: '123'
        },
        header: jest.fn().mockReturnValue('header')
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
    const response = [{
        "transactionId": 'dummy',
        "certificateId": 'dummy',
        "entityType":    'dummy',
        "status":        'dummy'
    }];
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

});

test('should get osid from transactionId', async () => {
    jest.resetModules();
    const req ={
        baseUrl:'/vc-management/v1/transaction',
        params: {
            transactionId: '123'
        },
        header: jest.fn().mockReturnValue('header')
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
    const transactionId = req.params.transactionId;
    const token = req.header;
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getTransaction').mockImplementation((a, b) => Promise.reject(new CustomError('some problem')))
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    await expect(sunbirdRegistryService.getTransaction(transactionId,token)).rejects.toThrow('some problem');
});

test('should get  404 for null reponse from sunbird', async () => {
    jest.resetModules();
    const req ={
        baseUrl:'/vc-management/v1/transaction',
        params: {
            transactionId: '123'
        },
        header: jest.fn().mockReturnValue('header')
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
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getTransaction').mockImplementation((a, b) => Promise.resolve([]));
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

});