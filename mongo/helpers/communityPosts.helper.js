// NPM Modules
const mongoose = require('mongoose');

// Model
const CommunityPosts = mongoose.model('CommunityPosts');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { COMMUNITY_POSTS } = require('../../redis/keys');

const CommunityPostsHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newPost = new CommunityPosts(obj);

    newPost
      .save()
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise(async (resolve) => {
    const posts = await getFromRedis(COMMUNITY_POSTS);

    if (!isNllOrUnd(posts)) {
      return resolve(posts);
    }

    return CommunityPosts
      .find(obj, project, opt)
      .then((data) => {
        setInRedis(COMMUNITY_POSTS, data);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  approvePostByPostId: (find, update, opt) => new Promise((resolve) => {
    CommunityPosts
      .updateOne(find, update, opt)
      .then((data) => {
        deleteFromRedis(COMMUNITY_POSTS);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = CommunityPostsHelpers;
