global.__basedir = __dirname;

// NPM Modules

// Check the config files
const checkConfig = require('./utils/checkConfig');

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'dev';
}

checkConfig();

// Utils
const Logger = require('./utils/winston');

// Mongo - All the database models
require('./mongo/mongo');

// Bull - Queueing system
require('./bull/bull');

// Tasks - Tasks that run on a schedule
require('./tasks/tasks');

// API - All the API components
require('./api');

Logger.info('API is Running');
