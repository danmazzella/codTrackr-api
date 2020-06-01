// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecentMatchStatsSchema = new Schema(
  {
    gamertag: {
      type: String,
      required: true,
    },
    modeType: {
      type: String,
      required: true,
    },
    kills: {
      type: Number,
      default: 0,
    },
    teamsWiped: {
      type: Number,
      default: 0,
    },
    lastStandKills: {
      type: Number,
      default: 0,
    },
    avgLifeTime: {
      type: Number,
      default: 0,
    },
    plunderCashBloodMoney: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    headshots: {
      type: Number,
      default: 0,
    },
    assists: {
      type: Number,
      default: 0,
    },
    killsPerGame: {
      type: Number,
      default: 0,
    },
    scorePerMinute: {
      type: Number,
      default: 0,
    },
    distanceTraveled: {
      type: Number,
      default: 0,
    },
    deaths: {
      type: Number,
      default: 0,
    },
    lootChopperBoxOpen: {
      type: Number,
      default: 0,
    },
    destroyedEquipment: {
      type: Number,
      default: 0,
    },
    kdRatio: {
      type: Number,
      default: 0,
    },
    missionPickupTablet: {
      type: Number,
      default: 0,
    },
    revives: {
      type: Number,
      default: 0,
    },
    kioskBuys: {
      type: Number,
      default: 0,
    },
    gulagKills: {
      type: Number,
      default: 0,
    },
    gulagDeaths: {
      type: Number,
      default: 0,
    },
    timePlayed: {
      type: Number,
      default: 0,
    },
    headshotPercent: {
      type: Number,
      default: 0,
    },
    executions: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    cachesOpened: {
      type: Number,
      default: 0,
    },
    damageDone: {
      type: Number,
      default: 0,
    },
    damageTaken: {
      type: Number,
      default: 0,
    },
    downsInCircleOne: {
      type: Number,
      default: 0,
    },
    downsInCircleTwo: {
      type: Number,
      default: 0,
    },
    downsInCircleThree: {
      type: Number,
      default: 0,
    },
    downsInCircleFour: {
      type: Number,
      default: 0,
    },
    downsInCircleFive: {
      type: Number,
      default: 0,
    },
    downsInCircleSix: {
      type: Number,
      default: 0,
    },
    damagePerMinute: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

RecentMatchStatsSchema.index({ gamertag: 1, modeType: 1 }, { unique: true });

module.exports = mongoose.model('RecentMatchStats', RecentMatchStatsSchema);
