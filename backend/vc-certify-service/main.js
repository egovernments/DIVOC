const constants = require('./configs/constants');
const http = require("http");
const schemaController = require("./src/controllers/schema_controller")
const certificateController = require("./src/controllers/certificate_controller")

const port = process.env.PORT || 7654;


const server = http.createServer(async (req, res) => {
    console.time(req.url)
    console.log(`API ${req.method} ${req.url} called`);
    if (req.method === 'POST' && req.url.startsWith(constants.BASE_PATH + "v1/schema")) {
        const data = await schemaController.createSchema(req, res);
        res.end(data)
    }
    if (req.method === 'POST' && req.url.match(constants.BASE_PATH + "v1/certify/.+")) {
        const data = await certificateController.createCertificate(req, res);
        res.end(data)
    }
    console.timeEnd(req.url)
});

server.listen(port, async () => {
    console.log(`Server listening on port ${port}`);
});