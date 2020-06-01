// NPM Modules
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const multipart = require('connect-multiparty');
const path = require('path');

// Init Configs
const app = express();
const port = process.env.PORT || 8081;

// Utils
const Logger = require('./utils/winston');

// CORS is necessary for cross-network requests
app.use(cors());
app.options('*', cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(multipart());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize all the routes (API Endpoints) that can be hit)
require('./routes/routes')(app);

// Swagger is an 'interactive' documentation that you can make requests with
require('./utils/swagger')(app);

// Start the API listening on a specific port
app.listen(port, () => {
  Logger.info(`COD Trackr API on port: ${port}`);
});

module.exports = app;
