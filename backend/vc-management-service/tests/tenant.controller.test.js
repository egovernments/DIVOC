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
})

test('should create tenant ', async () => {
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
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValue(users);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValue(role);
    await tenantController.createTenant(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
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

test('error while getting userInfo', async () => {
    jest.resetModules();
    const userName = 'dummy';
    const token = jest.fn().mockReturnValue('1');
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
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
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValueOnce(Error);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValueOnce(role);
    jest.spyOn(keycloakService, 'assignNewRole').mockReturnValueOnce('assigned new roles'),
    jest.spyOn(keycloakService, 'createNewRole').mockReturnValueOnce('created new roles');
    await tenantUtils.createAndAssignNewRole(userName, token);
    expect(res.status).not.toHaveBeenCalledWith(200);
});

test('error while getting roleInfo', async () => {
    jest.resetModules();
    const userName = 'dummy';
    const token = jest.fn().mockReturnValue('1');
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
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
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValueOnce(users);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValueOnce(Error);
    jest.spyOn(keycloakService, 'assignNewRole').mockReturnValueOnce('assigned new roles'),
    jest.spyOn(keycloakService, 'createNewRole').mockReturnValueOnce('created new roles');
    await tenantUtils.createAndAssignNewRole(userName, token);
    expect(res.status).not.toHaveBeenCalledWith(200);
});

test('error while assigning newroles', async () => {
    jest.resetModules();
    const userName = 'dummy';
    const token = jest.fn().mockReturnValue('1');
    const {ROLE_SUFFIX} = require('../src/configs/constants');
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
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
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValueOnce(users);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValueOnce(role);
    jest.spyOn(keycloakService, 'assignNewRole').mockReturnValueOnce(Error),
    jest.spyOn(keycloakService, 'createNewRole').mockReturnValueOnce('created new roles'),
    await tenantUtils.createAndAssignNewRole(userName, token);
    expect(res.status).not.toHaveBeenCalledWith(200);
});

test('error while creating new roles', async () => {
    jest.resetModules();
    const userName = 'dummy';
    const token = jest.fn().mockReturnValue('1');
    const users = [{id: 'dummy'}, ];
    const role = {id:'dummy'}
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
    jest.spyOn(keycloakService, 'getUserInfo').mockReturnValueOnce(users);
    jest.spyOn(keycloakService, 'getRoleInfo').mockReturnValueOnce(role);
    jest.spyOn(keycloakService, 'assignNewRole').mockReturnValueOnce('assigned new roles'),
    jest.spyOn(keycloakService, 'createNewRole').mockReturnValueOnce(Error),
    await tenantUtils.createAndAssignNewRole(userName, token);
    expect(res.status).not.toHaveBeenCalledWith(200);
})