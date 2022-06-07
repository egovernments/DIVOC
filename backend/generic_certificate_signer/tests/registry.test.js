const axios = require('axios');
jest.mock('axios');
const registry = require('../registry');

describe('should insert row to registry', () => {
    test('should call api to insert row in registry', () => {
        const certificate = {
            name: 'Dummy',
            certificateId: '588008871',
            certificate: '{"@context": [https://www.w3.org/2018/credentials/v1","https://gist.githubusercontent.com/varadeth/fff3a5a48bdf0adb4845410d507e97da/raw/8e5fb1a92c66f6fa0cd9a5d8cc8bed714ef97273/context.js"], "type": ["VerifiableCredential"], "name":"Dummy"}'
        }
        const expectedRequestBody = {
            id:  "open-saber.registry.create",
            ver: "1.0",
            ets: "",
            "request":{
                "Dummy": certificate
            }
        }
        registry.save(certificate, 'http://localhost:8081/', 'Dummy');
        expect(axios.default.post).toHaveBeenCalledWith('http://localhost:8081/add', expectedRequestBody);
    });


})