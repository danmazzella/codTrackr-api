// NPM Modules

// Controllers

// Services

// Config
const EnvConfig = require('../config/config.environment');

// Helpers
const MatchesHelper = require('../mongo/helpers/matches.helper');
const PlayersHelper = require('../mongo/helpers/players.helper');

// Bull
const fetchAllMatchesForUser = require('../bull/fetchAllUserMatches.bull');

// Utils
const CommonHelpers = require('../utils/commonHelpers');
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');
const Validator = require('../utils/validator');

const ScriptController = {
  recalculateOcaScores: async (req, res) => {
    try {
      // Set all oCa Scores to null where modeType = BR3 or BR1
      await MatchesHelper.resetAllMatchesOcaScore(
        {},
        {
          $set: {
            'stats.ocaScore': null,
          },
        },
      );

      // Get all matches where oCa Scores is null and modeType = BR3 or BR1
      const matchesNullStats = await MatchesHelper.findAllMatchesNullOcaScore([
        {
          $match: {
            'stats.ocaScore': null,
          },
        },
      ]);

      const savePromiseArr = [];

      // Loop through each one and calculate / save the oCa Score
      Object.keys(matchesNullStats).forEach((matchIdx) => {
        const match = matchesNullStats[matchIdx];
        // Calculate oCaScore for this match
        const newOcaScore = CommonHelpers.calculateOcaScore(match);
        match.stats.ocaScore = newOcaScore;

        // Save it for this match
        savePromiseArr.push(MatchesHelper.saveOneMatchesOcaScore(
          {
            matchId: match.matchId,
            playerName: match.playerName,
            modeType: match.modeType,
            placement: match.placement,
          },
          {
            'stats.ocaScore': newOcaScore,
          },
        ));
      });

      // Wait for promise all
      await Promise.all(savePromiseArr);

      // Return response
      return res.status(200).json({ success: true });
    } catch (error) {
      Logger.error('Unable to calculate scores: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  fetchAllMatchesForUser: async (req, res) => {
    try {
      const {
        authorization,
      } = req.headers;

      if (isNllOrUnd(authorization) || authorization !== EnvConfig.admin.apiKey) {
        return res.status(403).json(new MazzError().addPermError('Please pass authorization apiKey in header'));
      }

      const {
        gamertag,
      } = req.query;

      if (Validator.isNullOrUndefined(gamertag)) {
        return res.status(400).json(new MazzError().addParamError('Missing gamertag'));
      }

      const playerObj = await PlayersHelper.findOnePlayerByGamertag({ gamertag: Tools.lowerCaseRegex(gamertag, true) });

      if (Validator.isNullOrUndefined(playerObj) || Validator.isNullOrUndefined(playerObj.platform)) {
        return res.status(400).json(new MazzError().addParamError('Invalid gamertag'));
      }

      fetchAllMatchesForUser({
        gamertag: playerObj.gamertag,
        platform: playerObj.platform,
        startTime: 1581196358000,
        endTime: 1586380358000,
      });

      return { success: true };
    } catch (error) {
      Logger.error('Unable to fetch all matches for user: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
};

module.exports = ScriptController;