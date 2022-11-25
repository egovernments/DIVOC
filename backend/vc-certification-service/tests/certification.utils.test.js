const certificationUtils = require('../src/utils/certification.utils');
const {CustomError} = require("../src/models/errors");

beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
})

test('testing truncate shard', async () => {
    const osid = 'ab123';
    let truncatedValue = certificationUtils.truncateShard(osid);
    expect(truncatedValue).toEqual('123')
})

test('testing extract from array', async () => {
    const param = [{}];
    let actualValue = certificationUtils.extractFromArray(param);
    expect(actualValue).toEqual({})
})

test('extract from array should throw error when nothing is passed as argument', async () => {
    let param;
    let actualError;
    try {
        certificationUtils.extractFromArray(param);
    } catch (e) {
        actualError = e
    }
    expect(actualError).toEqual(new CustomError('undefined not available', 400))
})
