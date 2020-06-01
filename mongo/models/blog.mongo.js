// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const BlogSchema = new Schema(
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
    headerImage: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Blog', BlogSchema);
