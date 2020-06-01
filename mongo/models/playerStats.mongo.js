// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const PlayerStatsSchema = new Schema(
  {
    gamertag: {
      type: String,
      required: true,
    },
    modeType: {
      type: String,
      required: true,
    },
    wins: {
      type: Number,
      default: 0,
    },
    kills: {
      type: Number,
      default: 0,
    },
    kdRatio: {
      type: Number,
      default: 0,
    },
    downs: {
      type: Number,
      default: 0,
    },
    topTwentyFive: {
      type: Number,
      default: 0,
    },
    topTen: {
      type: Number,
      default: 0,
    },
    contracts: {
      type: Number,
      default: 0,
    },
    revives: {
      type: Number,
      default: 0,
    },
    topFive: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    timePlayed: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    scorePerMinute: {
      type: Number,
      default: 0,
    },
    cash: {
      type: Number,
      default: 0,
    },
    deaths: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

PlayerStatsSchema.index({ gamertag: 1, modeType: 1 }, { unique: true });

module.exports = mongoose.model('PlayerStats', PlayerStatsSchema);
