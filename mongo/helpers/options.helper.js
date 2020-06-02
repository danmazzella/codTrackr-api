// NPM Modules
const mongoose = require('mongoose');

// Model
const Options = mongoose.model('Options');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Datatypes
const { LAST_DATA_FETCH } = require('../../datatypes/options.datatypes');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { LAST_FETCH } = require('../../redis/keys');

const OptionsHelpers = {
  createNewLastFetch: obj => new Promise((resolve, reject) => new Options(obj)
    .save()
    .then((res) => {
      deleteFromRedis(LAST_FETCH);
      return resolve(res);
    })
    .catch(err => reject(err))),
  findLastFetch: (obj, opts = {}, sort = {}) => new Promise(async (resolve) => {
    const options = await getFromRedis(LAST_FETCH);

    if (!isNllOrUnd(options)) {
      return resolve(options);
    }

    return Options
      .findOne(obj, opts, sort)
      .then(async (_data) => {
        let data = _data;
        if (data === null) {
          data = await OptionsHelpers.createNewLastFetch({
            key: LAST_DATA_FETCH,
            value: new Date(0).getTime(),
          });
        }

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
        { upsert: true, new: true },
      )
      .then((data) => {
        deleteFromRedis(LAST_FETCH);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = OptionsHelpers;
