const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs')
const morganBody = require('morgan-body');

const tenantConfig = require('./src/configs/config');
const {BASE_URL} = require("./src/configs/config");
let tenantRouter = require('./src/routes/tenant.routes');
let schemaRouter = require('./src/routes/schema.routes');
let templateRouter = require('./src/routes/template.routes');
let transactionRouter = require('./src/routes/transaction.routes');
const contextRouter = require('./src/routes/context.routes');

const swaggerDocument = yaml.load('./management-service-swagger.yml');

const app = express();
const port = tenantConfig.PORT;
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

morganBody(app, {
    dateTimeFormat: 'iso',
    maxBodyLength: 1000000
});

app.use(`${BASE_URL}v1/tenant`, tenantRouter);
app.use(`${BASE_URL}v1/schema`, schemaRouter);
app.use(`${BASE_URL}v1/templates`, templateRouter);
app.use(`${BASE_URL}V1/transaction`,transactionRouter);
app.use(`${BASE_URL}v1/context`, contextRouter);

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
