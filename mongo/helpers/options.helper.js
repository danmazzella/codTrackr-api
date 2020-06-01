// NPM Modules
const mongoose = require('mongoose');

// Model
const Options = mongoose.model('Options');

const OptionsHelpers = {
  findLastFetch: (obj, opts = {}, sort = {}) => new Promise((resolve) => {
    Options
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  upsertLastFetch: (findObj, updateObj) => new Promise((resolve) => {
    Options
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
};


module.exports = OptionsHelpers;
