const ICAO9303_RE = new RegExp("^.*[A-Z<]$");

function validateEURequestBody(requestBody) {
  /*
  * fn and fnt are mandatory
  * gn is non-mandatory
  * gnt is mandatory if gn is present
  * gnt is present then gn should also be present
   */
  if (!(requestBody.fn && requestBody.fnt && ICAO9303_RE.test(requestBody.fnt)))
    return false;
  if (requestBody.gn && !(requestBody.gnt && ICAO9303_RE.test(requestBody.gnt)))
    return false;
  if (requestBody.gnt && !requestBody.gn)
    return false;

  return true;
}

module.exports = {
  validateEURequestBody
}
