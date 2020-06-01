// NPM Modules
const mongoose = require('mongoose');

// Model
const Blog = mongoose.model('Blog');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const Logger = require('../../utils/winston');

// Redis
const { getAsync, redisClient } = require('../../redis/redis');
const redisKeys = require('../../redis/keys');

const BlogHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newBlogPost = new Blog(obj);

    newBlogPost
      .save()
      .then((data) => {
        redisClient.del(redisKeys.blogPosts);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise(async (resolve) => {
    const posts = await getAsync(redisKeys.blogPosts);

    if (!isNllOrUnd(posts)) {
      try {
        const jsonPosts = JSON.parse(posts);

        if (jsonPosts.length > 0) {
          return resolve(jsonPosts);
        }
      } catch (error) {
        Logger.error('Unable to parse redis key: ', redisKeys.blogPosts);
      }
    }

    return Blog
      .find(obj, project, opt)
      .then((data) => {
        redisClient.set(redisKeys.blogPosts, JSON.stringify(data));
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = BlogHelpers;
