// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlayersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gamertag: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Players', PlayersSchema);
