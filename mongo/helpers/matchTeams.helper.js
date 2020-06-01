// NPM Modules
const mongoose = require('mongoose');

// Model
const MatchTeams = mongoose.model('MatchTeams');

const MatchHelpers = {
  build: obj => new Promise((resolve) => {
    const newMatch = new MatchTeams(obj);

    newMatch
      .save()
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  find: (obj, project = {}, opt = {}) => new Promise((resolve) => {
    MatchTeams
      .find(obj, project, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findOne: (obj, opts = {}, sort = {}) => new Promise((resolve) => {
    MatchTeams
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  updateOne: (find, update, opt) => new Promise((resolve) => {
    MatchTeams
      .updateOne(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  updateMany: (find, update, opt) => new Promise((resolve) => {
    MatchTeams
      .updateMany(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  upsert: (findObj, updateObj) => new Promise((resolve) => {
    MatchTeams
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregate: obj => new Promise((resolve) => {
    MatchTeams
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
};


module.exports = MatchHelpers;
