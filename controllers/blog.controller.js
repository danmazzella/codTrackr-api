// NPM Libraries
let PatrolMan = require('patrolman');

// Utils
const { isNllOrUnd } = require('../utils/validator');

// Helpers
const BlogHelper = require('../mongo/helpers/blog.helper');

// Policies
const PatrolManPolicies = require('../policies/config');

// Constants
PatrolMan = new PatrolMan(PatrolManPolicies);

const BlogController = {
  createPost: async (req, res) => {
    const {
      author,
      content,
      headerImage,
      title,
    } = req.body;

    const createPost = await BlogHelper.createNewPost({
      author,
      content,
      headerImage,
      title,
      epochTime: new Date().getTime(),
    });

    return res.status(200).json({ success: true, res: createPost });
  },
  getPosts: async (req, res) => {
    let posts = await BlogHelper.findAllPosts({}, undefined, { sort: { _id: -1 } });

    if (isNllOrUnd(posts)) {
      posts = [];
    }

    return res.status(200).json({ success: true, posts });
  },
};

module.exports = PatrolMan.patrol('blog', BlogController);
