// NPM Modules
const mongoose = require('mongoose');

// Model
const Matches = mongoose.model('Matches');

// Query Objects
const { GET_MATCHES_QUERY } = require('../queryObjects/matches.query');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const { arrayToRedisKey, replaceTemplateStrings } = require('../../utils/tools');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { NON_NULL_MATCHES } = require('../../redis/keys');


const MatchHelpers = {
  // CREATES

  // UPDATES
  resetAllMatchesOcaScore: (find, update, opt) => new Promise((resolve, reject) => {
    Matches
      .updateMany(find, update, opt)
      .then((data) => {
        deleteFromRedis(NON_NULL_MATCHES);
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  saveOneMatchesOcaScore: (find, update, opt) => new Promise((resolve, reject) => {
    Matches
      .updateOne(find, update, opt)
      .then((data) => {
        deleteFromRedis(NON_NULL_MATCHES);
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
        deleteFromRedis(NON_NULL_MATCHES);
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
  findNonNullWithModeAndPlayers: (replacementsObj, { modeType, players }) => new Promise(async (resolve, reject) => {
    const aggregateObject = replaceTemplateStrings(GET_MATCHES_QUERY, replacementsObj);

    if (modeType === 'solos') {
      aggregateObject[0].$match.modeType = 'Battle Royal Solos';
    } else if (modeType === 'duos') {
      aggregateObject[0].$match.modeType = 'Battle Royal Duos';
    } else if (modeType === 'threes') {
      aggregateObject[0].$match.modeType = 'Battle Royal Threes';
    } else if (modeType === 'quads') {
      aggregateObject[0].$match.modeType = 'Battle Royal Quads';
    }

    if (players !== undefined) {
      aggregateObject[0].$match.playerName = { $in: players };
    }

    const matches = await getFromRedis(`${NON_NULL_MATCHES}-${modeType}-${arrayToRedisKey(players)}`);

    if (!isNllOrUnd(matches)) {
      return resolve(matches);
    }

    return MatchHelpers
      .aggregateAndCount(aggregateObject)
      .then((data) => {
        setInRedis(`${NON_NULL_MATCHES}-${modeType}-${arrayToRedisKey(players)}`, data);
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  findNonNullWithMode: (replacementsObj, { modeType }) => new Promise(async (resolve, reject) => {
    const aggregateObject = replaceTemplateStrings(GET_MATCHES_QUERY, replacementsObj);

    if (modeType === 'solos') {
      aggregateObject[0].$match.modeType = 'Battle Royal Solos';
    } else if (modeType === 'duos') {
      aggregateObject[0].$match.modeType = 'Battle Royal Duos';
    } else if (modeType === 'threes') {
      aggregateObject[0].$match.modeType = 'Battle Royal Threes';
    } else if (modeType === 'quads') {
      aggregateObject[0].$match.modeType = 'Battle Royal Quads';
    }

    const matches = await getFromRedis(`${NON_NULL_MATCHES}-${modeType}`);

    if (!isNllOrUnd(matches)) {
      return resolve(matches);
    }

    return MatchHelpers
      .aggregateAndCount(aggregateObject)
      .then((data) => {
        setInRedis(`${NON_NULL_MATCHES}-${modeType}`, data);
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  findNonNullWithPlayers: (replacementsObj, { players }) => new Promise(async (resolve, reject) => {
    const aggregateObject = replaceTemplateStrings(GET_MATCHES_QUERY, replacementsObj);

    if (players !== undefined) {
      aggregateObject[0].$match.playerName = { $in: players };
    }

    const matches = await getFromRedis(`${NON_NULL_MATCHES}-${arrayToRedisKey(players)}`);

    if (!isNllOrUnd(matches)) {
      return resolve(matches);
    }

    return MatchHelpers
      .aggregateAndCount(aggregateObject)
      .then((data) => {
        setInRedis(`${NON_NULL_MATCHES}-${arrayToRedisKey(players)}`, data);
        return resolve(data);
      })
      .catch(err => reject(err));
  }),
  findAllNonNullMatches: replacementsObj => new Promise(async (resolve, reject) => {
    const aggregateObject = replaceTemplateStrings(GET_MATCHES_QUERY, replacementsObj);

    const matches = await getFromRedis(NON_NULL_MATCHES);

    if (!isNllOrUnd(matches)) {
      return resolve(matches);
    }

    return MatchHelpers
      .aggregateAndCount(aggregateObject)
      .then((data) => {
        setInRedis(NON_NULL_MATCHES, data);
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
