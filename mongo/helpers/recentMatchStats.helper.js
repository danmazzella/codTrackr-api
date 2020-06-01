// NPM Modules
const mongoose = require('mongoose');

// Model
const RecentMatchStats = mongoose.model('RecentMatchStats');

const RecentMatchStatsHelpers = {
  upsertByGamertagModeType: (findObj, updateObj) => new Promise((resolve) => {
    RecentMatchStats
      .updateOne(
        findObj,
        { $set: updateObj },
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  deleteByGamertag: findObj => new Promise((resolve) => {
    RecentMatchStats
      .deleteMany(findObj)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregateAndCount: _arrayOfObj => new Promise((resolve) => {
    const arrayOfObj = _arrayOfObj;
    RecentMatchStats
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

        return RecentMatchStats.aggregate(arrayOfObj).then((c) => {
          if (c.length > 0) {
            return resolve({ rows: data, count: c[0].count });
          }

          return resolve({ rows: data, count: 0 });
        });
      })
      .catch(err => resolve(err));
  }),
};


module.exports = RecentMatchStatsHelpers;
