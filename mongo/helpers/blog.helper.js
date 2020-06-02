// NPM Modules
const mongoose = require('mongoose');

// Model
const Blog = mongoose.model('Blog');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { BLOG_POSTS } = require('../../redis/keys');

const BlogHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newBlogPost = new Blog(obj);

    newBlogPost
      .save()
      .then((data) => {
        deleteFromRedis(BLOG_POSTS);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise(async (resolve) => {
    const posts = getFromRedis(BLOG_POSTS);

    if (!isNllOrUnd(posts)) {
      return resolve(posts);
    }

    return Blog
      .find(obj, project, opt)
      .then((data) => {
        setInRedis(BLOG_POSTS, data);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = BlogHelpers;
