// Config
const EnvConfig = require('../config/config.environment');
const MazzError = require('../utils/mazzErrors');

// Utils
const {
  isNllOrUnd,
} = require('../utils/validator');

// Helpers
const BlogHelper = require('../mongo/helpers/blog.helper');

const BlogController = {
  createPost: async (req, res) => {
    const {
      authorization,
    } = req.headers;

    if (isNllOrUnd(authorization) || authorization !== EnvConfig.admin.apiKey) {
      return res.status(403).json(new MazzError().addPermError('Please pass authorization apiKey in header'));
    }

    const {
      author,
      content,
      headerImage,
      title,
    } = req.body;

    const createPost = await BlogHelper.build({
      author,
      content,
      headerImage,
      title,
      epochTime: new Date().getTime(),
    });

    return res.status(200).json({ success: true, res: createPost });
  },
  getPosts: async (req, res) => {
    const posts = await BlogHelper.find({}, undefined, { sort: { _id: -1 } });
    return res.status(200).json({ success: true, posts });
  },
};

module.exports = BlogController;
