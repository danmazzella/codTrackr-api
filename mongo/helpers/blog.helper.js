// NPM Modules
const mongoose = require('mongoose');

// Model
const Blog = mongoose.model('Blog');

const BlogHelpers = {
  createNewPost: obj => new Promise((resolve) => {
    const newBlogPost = new Blog(obj);

    newBlogPost
      .save()
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findAllPosts: (obj, project = {}, opt = {}) => new Promise((resolve) => {
    Blog
      .find(obj, project, opt)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
};


module.exports = BlogHelpers;
