import {maskNationalId} from "./config";

test('mask last 4 digit from config', () => {
    const input = "1111222233334444"
    const maskedInput = maskNationalId(input)
    expect(maskedInput === "XXXXXXXXXXXX4444").toBe(true)
});
