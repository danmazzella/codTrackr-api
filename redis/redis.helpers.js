// Tools
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');

// Redis
const { getAsync, redisClient } = require('../redis/redis');

// Keys
const { NON_NULL_MATCHES, WEEK_MONTH_STATS } = require('./keys');

module.exports.deleteFromRedis = async (redisKey) => {
  redisClient.del(redisKey);
};

module.exports.deleteFromRedisWild = async (redisKey) => {
  redisClient.keys(redisKey, (err, rows) => rows.forEach(row => redisClient.del(row)));
};

module.exports.getFromRedis = async (redisKey) => {
  const data = await getAsync(redisKey);

  if (!isNllOrUnd(data)) {
    try {
      const redisData = JSON.parse(data);

      if (redisData.length > 0 || (!isNllOrUnd(redisData.rows) && redisData.rows.length > 0)) {
        return redisData;
      }
    } catch (error) {
      Logger.error('Unable to parse redis key: ', redisKey);
    }
  }

  return undefined;
};

module.exports.setInRedis = async (redisKey, data) => {
  redisClient.set(redisKey, JSON.stringify(data));
};

module.exports.clearRedisMatchKeys = () => {
  this.deleteFromRedis(NON_NULL_MATCHES);
  this.deleteFromRedis(WEEK_MONTH_STATS);
  this.deleteFromRedisWild(`${NON_NULL_MATCHES}*`);
};