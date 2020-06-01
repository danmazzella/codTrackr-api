// NPM Modules
const mongoose = require('mongoose');

// Model
const CommunityPosts = mongoose.model('CommunityPosts');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const Logger = require('../../utils/winston');

// Redis
const { getAsync, redisClient } = require('../../redis/redis');
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
    const posts = await getAsync(COMMUNITY_POSTS);

    if (!isNllOrUnd(posts)) {
      try {
        const jsonPosts = JSON.parse(posts);

        if (jsonPosts.length > 0) {
          return resolve(jsonPosts);
        }
      } catch (error) {
        Logger.error('Unable to parse redis key: ', COMMUNITY_POSTS);
      }
    }

    return CommunityPosts
      .find(obj, project, opt)
      .then((data) => {
        redisClient.set(COMMUNITY_POSTS, JSON.stringify(data));
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  approvePostByPostId: (find, update, opt) => new Promise((resolve) => {
    CommunityPosts
      .updateOne(find, update, opt)
      .then((data) => {
        redisClient.del(COMMUNITY_POSTS);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = CommunityPostsHelpers;
