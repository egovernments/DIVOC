beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const sunbirdRegistryService = require('../src/services/sunbird.service');
const transactionController = require('../src/controllers/transaction.controller');
jest.mock('../src/services/sunbird.service', () => {
    return {
        getTransaction: jest.fn()
    }
});
test('should get osid from transactionId', async () => {
    const req ={
        baseUrl:'/vc-management/v1/transaction',
        params: {
            osid: '123'
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

})