// NPM Modules
const mongoose = require('mongoose');

// Model
const Matches = mongoose.model('Matches');

const MatchHelpers = {
  findOneByMatchIdPlayerName: (obj, opts = {}, sort = {}) => new Promise((resolve) => {
    Matches
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findAllMatchesNullOcaScore: obj => new Promise((resolve) => {
    Matches
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  resetAllMatchesOcaScore: (find, update, opt) => new Promise((resolve) => {
    Matches
      .updateMany(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  saveOneMatchesOcaScore: (find, update, opt) => new Promise((resolve) => {
    Matches
      .updateOne(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  upsertByMatchIdPlayerName: (findObj, updateObj) => new Promise((resolve) => {
    Matches
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregate: obj => new Promise((resolve) => {
    Matches
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregateAndCount: _arrayOfObj => new Promise((resolve) => {
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
      .catch(err => resolve(err));
  }),
};


module.exports = MatchHelpers;