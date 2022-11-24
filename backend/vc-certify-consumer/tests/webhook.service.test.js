const axios = require('axios');
jest.mock('axios');
const webhookService = require('../src/services/webhook.service');
const constants = require('../src/configs/constants');
const sunbirdRegistryService = require('../src/services/sunbird.service');

test("should get tenant webhook details", async() => {
    const response = {
        webhookUrl: "123",
        webhookToken: "123"
    }
    axios.post.mockImplementation((url, body, headers) => Promise.resolve(response));
    const osOwner = "abc";
    const token = "123";
    jest.spyOn(sunbirdRegistryService, 'searchCertificate').mockReturnValue([{callbackUrl: '123', callbackToken:'123'}])
    const actualResponse = await webhookService.getTenantWebhookDetails(osOwner,token);
    expect(actualResponse).toEqual(response);
});

test("Should push to webhook", async () =>{
    const response = {
        data: {
            message: {}
        }
    };
    axios.post.mockImplementation((url, payload, headers) => Promise.resolve(response));
    const url = "abc";
    const token = "abc";
    const payload = "abc";
    console.log = jest.fn();
    await webhookService.pushToWebhook(token, url, payload);

    expect(console.log).toHaveBeenCalledWith(response);
    expect(axios.post).toHaveBeenCalledWith(url,payload,{headers: {Authorization:token}})
})

test("Should create error while push to webhook", async () =>{
    axios.post.mockImplementation((url, payload, headers) => Promise.reject(Error))
    const url = "abc";
    const token = "abc";
    const payload = "abc";
    console.log = jest.fn();
    await webhookService.pushToWebhook(token, url, payload);

    expect(console.log).toHaveBeenCalledWith(Error);
    expect(axios.post).toHaveBeenCalledWith(url,payload,{headers: {Authorization:token}})
})