// NPM Modules
const mongoose = require('mongoose');

// Model
const Blog = mongoose.model('Blog');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const Logger = require('../../utils/winston');

// Redis
const { getAsync, redisClient } = require('../../redis/redis');
const { BLOG_POSTS } = require('../../redis/keys');

const BlogHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newBlogPost = new Blog(obj);

    newBlogPost
      .save()
      .then((data) => {
        redisClient.del(BLOG_POSTS);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise(async (resolve) => {
    const posts = await getAsync(BLOG_POSTS);

    if (!isNllOrUnd(posts)) {
      try {
        const jsonPosts = JSON.parse(posts);

        if (jsonPosts.length > 0) {
          return resolve(jsonPosts);
        }
      } catch (error) {
        Logger.error('Unable to parse redis key: ', BLOG_POSTS);
      }
    }

    return Blog
      .find(obj, project, opt)
      .then((data) => {
        redisClient.set(BLOG_POSTS, JSON.stringify(data));
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = BlogHelpers;
