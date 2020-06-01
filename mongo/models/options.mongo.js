// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const OptionsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Options', OptionsSchema);
