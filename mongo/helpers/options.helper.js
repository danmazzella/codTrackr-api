// NPM Modules
const mongoose = require('mongoose');

// Model
const Options = mongoose.model('Options');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { LAST_FETCH } = require('../../redis/keys');

const OptionsHelpers = {
  findLastFetch: (obj, opts = {}, sort = {}) => new Promise(async (resolve) => {
    const options = await getFromRedis(LAST_FETCH);

    if (!isNllOrUnd(options)) {
      return resolve(options);
    }

    return Options
      .findOne(obj, opts, sort)
      .then((data) => {
        setInRedis(LAST_FETCH, data);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  upsertLastFetch: (findObj, updateObj) => new Promise((resolve) => {
    Options
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then((data) => {
        deleteFromRedis(LAST_FETCH);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = OptionsHelpers;
