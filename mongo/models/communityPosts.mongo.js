// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommunityPostsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    epochTime: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('CommunityPosts', CommunityPostsSchema);
