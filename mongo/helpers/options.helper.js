// NPM Modules
const mongoose = require('mongoose');

// Model
const Options = mongoose.model('Options');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const Logger = require('../../utils/winston');

// Redis
const { getAsync, redisClient } = require('../../redis/redis');
const { LAST_FETCH } = require('../../redis/keys');

const OptionsHelpers = {
  findLastFetch: (obj, opts = {}, sort = {}) => new Promise(async (resolve) => {
    const options = await getAsync(LAST_FETCH);

    if (!isNllOrUnd(options)) {
      try {
        const jsonOptions = JSON.parse(options);

        if (jsonOptions.length > 0) {
          return resolve(jsonOptions);
        }
      } catch (error) {
        Logger.error('Unable to parse redis key: ', LAST_FETCH);
      }
    }

    return Options
      .findOne(obj, opts, sort)
      .then((data) => {
        redisClient.set(LAST_FETCH, JSON.stringify(data));
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  upsertLastFetch: (findObj, updateObj) => new Promise((resolve) => {
    // TODO: Clear redis
    Options
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then((data) => {
        redisClient.del(LAST_FETCH);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = OptionsHelpers;
