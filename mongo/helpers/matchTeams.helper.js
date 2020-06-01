// NPM Modules
const mongoose = require('mongoose');

// Model
const MatchTeams = mongoose.model('MatchTeams');

const MatchTeamsHelpers = {
  upsertByMatchId: (findObj, updateObj) => new Promise((resolve) => {
    MatchTeams
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
};


module.exports = MatchTeamsHelpers;
