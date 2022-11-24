beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const sunbirdRegistryService = require('../src/services/sunbird.service');
const transactionController = require('../src/controllers/transaction.controller');
const { CustomError} = require('../src/models/error');

jest.mock('../src/services/sunbird.service', () => {
    return {
        getTransaction: jest.fn().mockImplementation((a, b) => {throw new Error('some problem')})
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
    jest.spyOn(sunbirdRegistryService, 'getTransaction').mockReturnValue(response);
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

});

test('should get osid from transactionId for multiple response objects', async () => {
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
    },{
        "transactionId": '1',
        "certificateId": '1',
        "entityType":    '1',
        "status":        '1'
    }];
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getTransaction').mockReturnValue(response);
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

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
    const response = [];
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(sunbirdRegistryService, 'getTransaction').mockReturnValue(response);
    await transactionController.getTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);

});

// test('should get into catch block', async () => {
//     jest.resetModules();
//     const req ={
//         baseUrl:'/vc-management/v1/transaction',
//         params: {
//             transactionId: '123'
//         },
//         header: jest.fn().mockReturnValue('header')
//     };
//     const res = {
//         send: function(){},
//         json: function(d) {
//         },
//         status: function(s) {
//             this.statusCode = s;
//             return this;
//         }
//     }
//     jest.spyOn(res, 'status');
//     await expect(transactionController.getTransaction(req, res)).rejects.toThrowError("some problem");
//     await expect(res.status).toHaveBeenCalledWith(500);

// });