beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

const utils = require('../src/utils/utils');

test('check if id is valid user id', () => {
    expect(utils.isValidUserId('abc@xyz.com')).toBe(true);
    expect(utils.isValidUserId('@xyz.com')).toBe(false);
    expect(utils.isValidUserId('abc@.com')).toBe(false);
    expect(utils.isValidUserId('abc@xyz.')).toBe(false);
    expect(utils.isValidUserId('abc.com')).toBe(false);
    expect(utils.isValidUserId('abc')).toBe(false);
    expect(utils.isValidUserId('abc.com')).toBe(false);
    expect(utils.isValidUserId('')).toBe(false);
});

test('check if name is valid tenant name', () => {
    expect(utils.isValidTenantName('abc')).toBe(true);
    expect(utils.isValidTenantName('123')).toBe(false);
    expect(utils.isValidTenantName('abc123')).toBe(false);
    expect(utils.isValidTenantName('ab@xyz')).toBe(false);
    expect(utils.isValidTenantName('ab!')).toBe(false);
    expect(utils.isValidTenantName('')).toBe(false);
    expect(utils.isValidTenantName('abc.')).toBe(false);
})