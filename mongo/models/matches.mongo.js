// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const MatchesSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
    },
    playerName: {
      type: String,
      required: true,
    },
    modeType: {
      type: String,
      required: true,
    },
    origGameMode: {
      type: String,
    },
    matchDuration: {
      type: Number,
      default: null,
    },
    matchTime: {
      type: Date,
      default: null,
    },
    playerCount: {
      type: Number,
      default: null,
    },
    mapName: {
      type: String,
      default: 'Verdansk',
    },
    placement: {
      type: Number,
      default: null,
    },
    players: {
      type: Array,
      default: null,
    },
    stats: {
      kills: {
        type: Number,
        default: null,
      },
      score: {
        type: Number,
        default: null,
      },
      timePlayedSeconds: {
        type: Number,
        default: null,
      },
      headshots: {
        type: Number,
        default: null,
      },
      executions: {
        type: Number,
        default: null,
      },
      assists: {
        type: Number,
        default: null,
      },
      percentTimeMoving: {
        type: Number,
        default: null,
      },
      scorePerMinute: {
        type: Number,
        default: null,
      },
      damageDone: {
        type: Number,
        default: null,
      },
      distanceTraveled: {
        type: Number,
        default: null,
      },
      deaths: {
        type: Number,
        default: null,
      },
      damageTaken: {
        type: Number,
        default: null,
      },
      teamSurvivalTime: {
        type: Number,
        default: null,
      },
      gulagDeaths: {
        type: Number,
        default: null,
      },
      gulagKills: {
        type: Number,
        default: null,
      },
      cachesOpened: {
        type: Number,
        default: null,
      },
      damagePerMinute: {
        type: Number,
        default: null,
      },
      teamsWiped: {
        type: Number,
        default: 0,
      },
      lastStandKills: {
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
      ocaScore: {
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
    },
  },
  {
    timestamps: true,
  },
);

MatchesSchema.index({ matchId: 1, playerName: 1 }, { unique: true });

module.exports = mongoose.model('Matches', MatchesSchema);
