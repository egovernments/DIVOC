const axios = require('axios');
jest.mock('axios');
const keycloakServices = require('../src/services/keycloak.service');

const config = require('../src/configs/config');
const constants = require('../src/configs/constants');

test('create new roles', async () => {
    const expectedResponse = {
        data: {
            message: 'created new roles',
            rolesResponse: {}
        }
    };
    const token = 123;
    const roleName = 'abc';
    const url = `${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/roles`;
    axios.post.mockImplementation((url, role, header) => Promise.resolve(expectedResponse));
    const actualResponse = await keycloakServices.createNewRole(roleName, token);
    expect(axios.post).toHaveBeenCalledWith(url, {"name": roleName}, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(expectedResponse.data);
});

test('error create new roles', async () => {
    const token = 123;
    const roleName = 'abc';
    axios.post.mockImplementation((url, role, header) => Promise.reject(new Error('some problem')));
    expect(keycloakServices.createNewRole(roleName, token)).rejects.toThrow('some problem');

});

test('assign new roles', async () => {
    const expectedResponse ={
        data: {
            message: 'assigned new roles',
            response: {}
        }
    };
    const roles = [{"id": 'dummy',"name": 'dummy'}]
    const token = 123;
    const userId = 'abc';
    const url =`${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`;
    axios.post.mockImplementation((url, roles, token) => Promise.resolve(expectedResponse));
    const actualResponse = await keycloakServices.assignNewRole(roles, userId, token);
    expect(axios.post).toHaveBeenCalledWith(url, roles, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(expectedResponse.data);
});

test('error assign new roles', async () => {
    const roles = [{"id": 'dummy',"name": 'dummy'}]
    const token = 123;
    const userId = 'abc';
    axios.post.mockImplementation((url, roles, token) => Promise.reject(new Error('some problem')));
    expect(keycloakServices.assignNewRole(roles, userId, token)).rejects.toThrow('some problem');
});

test('get user info', async () => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const token = 123;
    const userName = 'abc';
    const url = `${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/users?username=${userName}`; 
    axios.get.mockImplementation((url, req) => Promise.resolve(expectedResponse));
    const actualResponse = await keycloakServices.getUserInfo(userName, token);
    expect(axios.get).toHaveBeenCalledWith(url, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(expectedResponse.data);
});

test('error get user info', async () => {
    const token = 123;
    const userName = 'abc';
    axios.get.mockImplementation((url, req) => Promise.reject(new Error('some problem')));
    expect(keycloakServices.getUserInfo(userName, token)).rejects.toThrow('some problem');
});

test('get role info', async () => {
    const expectedResponse = {
        data: {
            message: {}
        }
    };
    const token = 123;
    const roleName = 'abc';
    const url = `${config.KEYCLOAK_URL}/auth/admin/realms/${config.KEYCLOAK_REALM}/roles/${roleName}`;
    axios.get.mockImplementation((url, req) => Promise.resolve(expectedResponse));
    const actualResponse = await keycloakServices.getRoleInfo(roleName, token);
    expect(axios.get).toHaveBeenCalledWith(url, {headers: {Authorization: token}});
    expect(actualResponse).toEqual(expectedResponse.data);
});

test('error get role info', async () => {
    const token = 123;
    const userName = 'abc';
    axios.get.mockImplementation((url, req) => Promise.reject(new Error('some problem')));
    expect(keycloakServices.getRoleInfo(userName, token)).rejects.toThrow('some problem');
});