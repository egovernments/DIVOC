const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs')
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');

const issuerConfig = require('./src/configs/config');
const {BASE_URL} = require("./src/configs/config");
let issuerRouter = require('./src/routes/issuer.routes');
let schemaRouter = require('./src/routes/schema.routes');
let templateRouter = require('./src/routes/template.routes');

const swaggerDocument = yaml.load('./management-service-swagger.yml');

const app = express();
const port = issuerConfig.PORT;
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

// var fileWrite = fs.createWriteStream(path.join(__dirname, 'logs.log'), {flags: 'a'});
var fileWrite = rfs.createStream('reqres.log', {
    interval: '1d',
    path: path.join(__dirname, 'log')
});
app.use(morgan(function(tokens, req, res) {
    return ["\n\n",
        "Method : " + tokens.method(req, res),
        "URL : " + tokens.url(req, res),
        "Status : " + tokens.status(req, res),
        "Headers : " + function(req, res) {
            return JSON.stringify(req.headers);
        }(req, res),
        "Body : " + function(req, res) {
            return JSON.stringify(req.body);
        }(req, res),
        "Date : " + new Date() 
    ].join('\n')
}, {stream: fileWrite}));

app.use(`${BASE_URL}v1/issuer`, issuerRouter);
app.use(`${BASE_URL}v1/schema`, schemaRouter);
app.use(`${BASE_URL}v1/templates`, templateRouter);

app.use(
    `${BASE_URL}api-docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).json({
        message: "No such route exists"
    })
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: "Error Message"
    })
});

app.listen(port, async () => {
    console.log(`Server listening on port: ${port}`);
});
