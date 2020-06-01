// Utils
const CODAPI = require('../utils/cod-api');
const Logger = require('../utils/winston');
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');
const Validator = require('../utils/validator');

// Validator
const MatchesValidator = require('../validators/matches.validator');

// Mongo Helpers
const PlayerHelpers = require('../mongo/helpers/players.helper');

// Services
const MatchesService = require('../services/matches.service');

const MatchesController = {
  getMatches: async (req, res) => {
    try {
      const {
        modeType,
        page,
        pageSize,
        players,
      } = MatchesValidator.getMatches(req);

      const returnObj = await MatchesService.getMatches({
        modeType,
        page,
        pageSize,
        players,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Error getting matches ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  fetchMatchesForUser: async (req, res) => {
    try {
      const {
        gamertag,
      } = req.params;

      // Validation on inputs
      if (Validator.isNullOrUndefined(gamertag) || !Validator.isValidString(gamertag)) {
        return res.status(400).json(new MazzError().addParamError('Missing or invalid gamertag'));
      }

      const playerObj = await PlayerHelpers.findOne({ gamertag: Tools.lowerCaseRegex(gamertag, true) });

      if (Validator.isNullOrUndefined(playerObj) || Validator.isNullOrUndefined(playerObj.gamertag)) {
        return res.status(400).json('No gamer found with passed gamertag');
      }

      const matches = await CODAPI.warzoneLatestMatches(playerObj.gamertag, playerObj.platform);

      await MatchesService.saveRecentMatchStats(playerObj.gamertag, matches);

      await MatchesService.saveMatchesForUser(playerObj.gamertag, matches.matches);

      return res.status(200).json({ success: true, matches });
    } catch (error) {
      Logger.error('Error getting matches ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getTopFiveGames: async (req, res) => {
    try {
      const {
        monthFilter,
        page,
        pageSize,
        players,
      } = MatchesValidator.getTopFiveGames(req);

      const returnObj = await MatchesService.getTopFiveGames({
        monthFilter,
        page,
        pageSize,
        players,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Error getting top five games ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getMatch: async (req, res) => {
    try {
      const {
        gamertag,
        matchId,
        mazzError,
      } = MatchesValidator.getMatch(req);

      if (mazzError.isErrors()) {
        return res.status(mazzError.code).json(mazzError);
      }

      const returnObj = await MatchesService.getMatch({
        gamertag,
        matchId,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Error getting match: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
};

module.exports = MatchesController;
