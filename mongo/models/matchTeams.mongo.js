// NPM Modules
const mongoose = require('mongoose');

const { Schema } = mongoose;

const MatchTeamsSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
      unique: true,
    },
    rankedTeams: [
      {
        type: Object,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('MatchTeams', MatchTeamsSchema);
