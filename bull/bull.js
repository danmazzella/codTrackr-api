const Queue = require('bull');

const config = require('../config/config.environment');

const options = {};

options.redis = {
  host: config.redis.url,
  port: config.redis.port,
};

const fetchAllUserMatchesQueue = new Queue('fetchAllUserMatches', options);
const fetchUserStatsQueue = new Queue('fetchUserStats', options);

const queues = {
  fetchAllUserMatchesQueue,
  fetchUserStatsQueue,
};

module.exports = queues;

require('./fetchAllUserMatches.bull');
require('./fetchUserStats.bull');
