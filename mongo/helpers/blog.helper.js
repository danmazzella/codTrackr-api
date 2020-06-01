// NPM Modules
const mongoose = require('mongoose');

// Model
const Blog = mongoose.model('Blog');

const BlogHelpers = {
  build: obj => new Promise((resolve) => {
    const newMatch = new Blog(obj);

    newMatch
      .save()
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  find: (obj, project = {}, opt = {}) => new Promise((resolve) => {
    Blog
      .find(obj, project, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findOne: (obj, opts = {}, sort = {}) => new Promise((resolve) => {
    Blog
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  updateOne: (find, update, opt) => new Promise((resolve) => {
    Blog
      .updateOne(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  updateMany: (find, update, opt) => new Promise((resolve) => {
    Blog
      .updateMany(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  upsert: (findObj, updateObj) => new Promise((resolve) => {
    Blog
      .updateOne(
        findObj,
        updateObj,
        { upsert: true },
      )
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregate: obj => new Promise((resolve) => {
    Blog
      .aggregate(obj)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  aggregateAndCount: _arrayOfObj => new Promise((resolve) => {
    const arrayOfObj = _arrayOfObj;
    Blog
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

        return Blog.aggregate(arrayOfObj).then((c) => {
          if (c.length > 0) {
            return resolve({ rows: data, count: c[0].count });
          }

          return resolve({ rows: data, count: 0 });
        });
      })
      .catch(err => resolve(err));
  }),
};


module.exports = BlogHelpers;
