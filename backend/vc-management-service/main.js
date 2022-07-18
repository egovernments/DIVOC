const express = require('express');
const bodyParser = require('body-parser');

const issuerConfig = require('./src/configs/config');
const {BASE_URL} = require("./src/configs/config");
let issuerRouter = require('./src/routes/issuer.routes');
let schemaRouter = require('./src/routes/schema.routes');
let templateRouter = require('./src/routes/template.routes');

const app = express();
const port = issuerConfig.PORT;
app.use(bodyParser.urlencoded({extended: false}));
app.use((bodyParser.json()));

app.use(`${BASE_URL}v1/issuer`, issuerRouter);
app.use(`${BASE_URL}v1/schema`, schemaRouter);
app.use(`${BASE_URL}v1/templates`, templateRouter);

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
