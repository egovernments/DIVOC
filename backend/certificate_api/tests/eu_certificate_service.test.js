const {validateEURequestBody} = require("../src/services/eu_certficate_service");

describe("validation for EU request body", () => {
  test('return false if empty', () => {
    const valid = validateEURequestBody({})

    expect(valid).toEqual(false)
  });

  test('return false if fn is missing or empty', () => {
    const valid = validateEURequestBody({"fn": ""})

    expect(valid).toEqual(false)
  })

  test('return false if fnt is missing or empty', () => {
    let valid = validateEURequestBody({"fn": "d'Arsøns - van Halen"})
    expect(valid).toEqual(false)

    valid = validateEURequestBody({"fn": "d'Arsøns - van Halen", "fnt": ""})
    expect(valid).toEqual(false)
  })

  test('return true if fn, fnt are present', () => {
    const valid = validateEURequestBody({"fn": "d'Arsøns - van Halen", "fnt": "DARSONS<VAN<HALEN"})

    expect(valid).toEqual(true)
  })

  test('return false if gn is present and gnt is missing or empty', () => {
    const valid = validateEURequestBody({
      "fn": "d'Arsøns - van Halen",
      "fnt": "DARSONS<VAN<HALEN",
      "gn": "François-Joan"
    })

    expect(valid).toEqual(false)
  });

  test('return true if gn, gnt are present', () => {
    const valid = validateEURequestBody({
      "fn": "d'Arsøns - van Halen",
      "fnt": "DARSONS<VAN<HALEN",
      "gn": "François-Joan",
      "gnt": "FRANCOIS<JOAN"
    })

    expect(valid).toEqual(true)
  })

  test('return false if translated names have invalid charecter', () => {
    const valid = validateEURequestBody({
      "fn": "d'Arsøns - van Halen",
      "fnt": "dARSONS-<VAN<H'ALENç",
      "gn": "François-Joan",
      "gnt": "FRANçOI-S<JOAN"
    });

    expect(valid).toEqual(false)
  })

  test('return false if gnt is present without gn', () => {
    const valid = validateEURequestBody({
      "fn": "d'Arsøns - van Halen",
      "fnt": "DARSONS<VAN<HALEN",
      "gnt": "FRANCOIS<JOAN"
    });

    expect(valid).toEqual(false)
  })
})