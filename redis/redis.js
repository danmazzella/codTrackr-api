// NPM Libraries
const { promisify } = require('util');
const redis = require('redis');

// Config
const Config = require('../config/config.environment');

// Constants
const client = redis.createClient(Config.redis.port, Config.redis.url);

// Utils
const logger = require('../utils/winston');

client.on('connect', () => {
  logger.debug('Redis Connected');
});

const getAsync = promisify(client.get).bind(client);

module.exports.getAsync = getAsync;
module.exports.redisClient = client;
