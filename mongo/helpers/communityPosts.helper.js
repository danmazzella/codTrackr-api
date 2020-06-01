// NPM Modules
const mongoose = require('mongoose');

// Model
const CommunityPosts = mongoose.model('CommunityPosts');

const CommunityPostsHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newPost = new CommunityPosts(obj);

    newPost
      .save()
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise((resolve) => {
    CommunityPosts
      .find(obj, project, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  approvePostByPostId: (find, update, opt) => new Promise((resolve) => {
    CommunityPosts
      .updateOne(find, update, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
};


module.exports = CommunityPostsHelpers;
