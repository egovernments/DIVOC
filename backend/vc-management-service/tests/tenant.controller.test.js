beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
})

const keycloakService = require('../src/services/keycloak.service')
const utils = require('../src/utils/utils')
const sunbirdRegistryService = require('../src/services/sunbird.service')
const tenantController = require('../src/controllers/tenant.controller')

jest.mock('../src/services/keycloak.service', () => {
    return {
        generateUserToken: jest.fn().mockImplementation((a) => {} ),
        getUserInfo: jest.fn(),
        getRoleInfo: jest.fn(),
        assignNewRole: jest.fn(),
        createNewRole: jest.fn()
    }
});

jest.mock('../src/utils/utils', () => {
    return {
        isValidUserId: jest.fn()
    }
});

jest.mock('../src/services/sunbird.service', () => {
    return {
        createTenant: jest.fn()
    }
})

test('should throw invalid user ID error while creating tenant' , async () => {
    const req = {
        header: jest.fn().mockReturnValue("header"),
        raw:{
            "accountDetails": {
                "userId": "abc@xyz.com"
            }
        }
    };
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
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
});
