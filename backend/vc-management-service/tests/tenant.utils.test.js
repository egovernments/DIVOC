beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const tenantUtils = require('../src/utils/tenant.utils');
const keycloakService = require('../src/services/keycloak.service');

jest.mock('../src/services/keycloak.service', () => {
    return{
        createNewRole: jest.fn().mockImplementation((a, b) => Promise.resolve()),
        assignNewRole: jest.fn().mockImplementation((a, b, c) => Promise.resolve()),
        getRoleInfo: jest.fn().mockImplementation((a, b) => Promise.resolve({id:'abc'})),
        getUserInfo: jest.fn().mockImplementation((a, b) => Promise.resolve([{id:'xyz'}]))
    }
})
test('succssfully created and assigned new roles ', async () => {
    jest.resetModules();
    const userName = 'abc';
    const token = '1';
    await tenantUtils.createAndAssignNewRole(userName, token);
});

test('create new role failure', async () => {
    jest.resetModules();
    const userName = 'abc';
    const token = '1';
    let ThrownError;
    jest.spyOn(keycloakService, 'createNewRole').mockImplementationOnce(() => Promise.reject('Error'));
    try {
        await tenantUtils.createAndAssignNewRole(userName, token);
    } catch(err) {
        ThrownError = err
    };
    expect(ThrownError).toEqual('Error');
});

test('assign new role failure', async () => {
    jest.resetModules();
    const userName = 'abc';
    const token = '1';
    let ThrownError;
    jest.spyOn(keycloakService, 'assignNewRole').mockImplementationOnce(() => Promise.reject('Error'));
    try {
        await tenantUtils.createAndAssignNewRole(userName, token);
    } catch(err) {
        ThrownError = err
    };
    expect(ThrownError).toEqual('Error');
});

test('get role info failure', async () => {
    jest.resetModules();
    const userName = 'abc';
    const token = '1';
    let ThrownError;
    jest.spyOn(keycloakService, 'getRoleInfo').mockImplementationOnce(() => Promise.reject('Error'));
    try {
        await tenantUtils.createAndAssignNewRole(userName, token);
    } catch(err) {
        ThrownError = err
    };
    expect(ThrownError).toEqual('Error');
});

test('get user info failure', async () => {
    jest.resetModules();
    const userName = 'abc';
    const token = '1';
    let ThrownError;
    jest.spyOn(keycloakService, 'getUserInfo').mockImplementationOnce(() => Promise.reject(new Error('some problem')));
    expect(tenantUtils.createAndAssignNewRole(userName, token)).rejects.toThrow('some problem');
});