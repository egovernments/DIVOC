beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
})

const keycloakService = require('../src/services/keycloak.service')
const utils = require('../src/utils/utils')
const tenantUtils = require('../src/utils/tenant.utils')
const sunbirdRegistryService = require('../src/services/sunbird.service')
const tenantController = require('../src/controllers/tenant.controller')

jest.mock('../src/services/keycloak.service', () => {
    return {
        generateUserToken: jest.fn().mockImplementation((a) => Promise.resolve('token') ),
        getUserInfo: jest.fn(),
        getRoleInfo: jest.fn(),
        assignNewRole: jest.fn().mockImplementation((a, b, c) => Promise.resolve('assigned new roles')),
        createNewRole: jest.fn().mockImplementation((a, b) => Promise.resolve('created new role'))
    }
});

jest.mock('../src/utils/utils', () => {
    return {
        isValidUserId: jest.fn().mockImplementation((a) => true)
    }
});

jest.mock('../src/services/sunbird.service', () => {
    return {
        createTenant: jest.fn().mockImplementation((a) => Promise.resolve('created Tenant'))
    }
});

jest.mock('../src/utils/tenant.utils' , () => {
    return {
        createAndAssignNewRole: jest.fn().mockImplementation((a, b) => Promise.resolve('successfully created and assigned new roles'))
    }
})

test('should create tenant', async () => {
    jest.resetModules();
    const req = {
        header: jest.fn().mockReturnValue("1"),
        raw:{
            'accountDdetails':{
                'userId': 'abc@xyz.com'
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
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not create tenant if sunbird service fails', async () => {
    jest.resetModules();
    const req = {
        header: jest.fn().mockReturnValue("1"),
        raw:{
            'accountDdetails':{
                'userId': 'abc@xyz.com'
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
    jest.spyOn(sunbirdRegistryService, 'createTenant').mockImplementationOnce((a) => Promise.reject('created Tenant'));
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should not create tenant if error occurs during create and assign new roles', async () => {
    jest.resetModules();
    const req = {
        header: jest.fn().mockReturnValue("1"),
        raw:{
            'accountDdetails':{
                'userId': 'abc@xyz.com'
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
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(tenantUtils, 'createAndAssignNewRole').mockImplementationOnce((a, b) => Promise.reject('successfully created and assigned new roles'));
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should not create tenant if userId is invalid', async () => {
    jest.resetModules();
    const req = {
        header: jest.fn().mockReturnValue("1"),
        raw:{
            'accountDdetails':{
                'userId': 'abc@xyz.com'
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
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(utils, 'isValidUserId').mockReturnValueOnce(false);
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValue(users);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValue(role);
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
})

test('should generate token', async () =>{
    jest.resetModules();
    const req = {
        params: {
            userId: "dummy1@gmail.com"
        },
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
    await tenantController.generateToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('should not generate token when keycloak service fails ', async () =>{
    jest.resetModules();
    const req = {
        params: {
            userId: "dummy1@gmail.com"
        },
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
    jest.spyOn(keycloakService, 'generateUserToken').mockImplementation((a) => Promise.reject('token') );
    await tenantController.generateToken(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
});

test('should throw invalid userId error ', async () =>{
    jest.resetModules();
    const req = {
        params: {
            userId: ""
        },
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
    jest.spyOn(utils, 'isValidUserId').mockReturnValue(false);
    await tenantController.generateToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
});
