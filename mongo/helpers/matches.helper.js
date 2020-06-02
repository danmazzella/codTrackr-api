// NPM Modules
const mongoose = require('mongoose');

// Model
const Matches = mongoose.model('Matches');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Redis
const {
  clearRedisMatchKeys,
  getFromRedis,
  setInRedis,
} = require('../../redis/redis.helpers');


const MatchHelpers = {
  // CREATES

  // UPDATES
  resetAllMatchesOcaScore: (find, update, opt) => new Promise((resolve, reject) => {
    Matches
      .updateMany(find, update, opt)
      .then((data) => {
        clearRedisMatchKeys();
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  saveOneMatchesOcaScore: (find, update, opt) => new Promise((resolve, reject) => {
    Matches
      .updateOne(find, update, opt)
      .then((data) => {
        clearRedisMatchKeys();
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  upsertByMatchIdPlayerName: (findObj, updateObj) => new Promise((resolve, reject) => {
    Matches
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then((data) => {
        clearRedisMatchKeys();
        return resolve(data);
      })
      .catch(err => reject(err));
  }),

  // DELETES

  // FINDS
  findOneByMatchIdPlayerName: (obj, opts = {}, sort = {}) => new Promise((resolve, reject) => {
    Matches
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => reject(err));
  }),
  findAllMatchesNullOcaScore: obj => new Promise((resolve, reject) => {
    Matches
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => reject(err));
  }),
  findAllNonNullMatchesWithParams: (aggregateObject, redisKey) => new Promise(async (resolve, reject) => {
    const matches = await getFromRedis(redisKey);

    if (!isNllOrUnd(matches)) {
      return resolve(matches);
    }

    return MatchHelpers
      .aggregateAndCount(aggregateObject)
      .then((data) => {
        setInRedis(redisKey, data);
        return resolve(data);
      })
      .catch(err => reject(err));
  }),

  // Funcs
  aggregate: obj => new Promise((resolve, reject) => {
    Matches
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => reject(err));
  }),
  aggregateAndCount: _arrayOfObj => new Promise((resolve, reject) => {
    const arrayOfObj = _arrayOfObj;
    Matches
      .aggregate(arrayOfObj)
      .then((data) => {
        if (data == null) return resolve(null);

        for (let arrayOfObjIdx = arrayOfObj.length - 1; arrayOfObjIdx >= 0; arrayOfObjIdx -= 1) {
          const key = arrayOfObj[arrayOfObjIdx];
          if (Object.keys(key).length > 0) {
            const keyName = Object.keys(key)[0];
            if (keyName === '$skip' || keyName === '$limit') {
              arrayOfObj.splice(arrayOfObjIdx, 1);
            }
          }
        }

        arrayOfObj.push({ $count: 'count' });

        return Matches.aggregate(arrayOfObj).then((c) => {
          if (c.length > 0) {
            return resolve({ rows: data, count: c[0].count });
          }

          return resolve({ rows: data, count: 0 });
        });
      })
      .catch(err => reject(err));
  }),
};


module.exports = MatchHelpers;
