// NPM Libraries
let PatrolMan = require('patrolman');

// Utils
const CODAPI = require('../utils/cod-api');
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');

// Datatypes
const { LAST_DATA_FETCH } = require('../datatypes/options.datatypes');

// Mongo Helpers
const OptionsHelper = require('../mongo/helpers/options.helper');
const PlayerHelpers = require('../mongo/helpers/players.helper');

// Validators
const PlayersValidator = require('../validators/players.validators');

// Services
const PlayerService = require('../services/players.service');

// Tasks
const fetchUserStatsTask = require('../tasks/fetchUserStats.task');

// Policies
const PatrolManPolicies = require('../policies/config');

// Constants
PatrolMan = new PatrolMan(PatrolManPolicies);

const PlayerController = {
  addPlayer: async (req, res) => {
    const {
      name,
      gamertag,
      platform,
      mazzError,
    } = PlayersValidator.addPlayer(req);

    if (mazzError.isErrors()) {
      return res.status(mazzError.code).json(mazzError);
    }

    const playerObj = await PlayerHelpers.addNewPlayer({
      name, gamertag, platform,
    });

    return res.status(200).json({ success: true, player: playerObj });
  },
  getPlayers: async (req, res) => {
    try {
      const players = await PlayerHelpers.findAllPlayers({});

      const lastFetch = await OptionsHelper.findLastFetch({ key: LAST_DATA_FETCH });

      return res.status(200).json({ success: true, players, lastFetch: lastFetch.value });
    } catch (error) {
      Logger.error('Error in getPlayers: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  searchPlayers: async (req, res) => {
    // TODO: Validate the params/query
    const searchRes = await CODAPI.userSearch(req.params.gamertag, req.query.platform);
    return res.status(200).json({ success: true, results: searchRes });
  },
  fetchPlayerStats: async (req, res) => {
    try {
      const {
        gamertag,
        mazzError,
      } = PlayersValidator.fetchPlayerStats(req);

      if (mazzError.isErrors()) {
        return res.status(mazzError.code).json(mazzError);
      }

      const playerObj = await PlayerHelpers.findOnePlayerByGamertag({ gamertag: Tools.lowerCaseRegex(gamertag, true) });

      if (isNllOrUnd(playerObj) || isNllOrUnd(playerObj.platform)) {
        return res.status(400).json(new MazzError().addParamError('Player not found in oCa database'));
      }

      const playerStats = await CODAPI.getMPStats(playerObj.gamertag, playerObj.platform);

      await PlayerService.savePlayerStats(playerObj.gamertag, playerStats);

      return res.status(200).json({ success: true, playerStats });
    } catch (error) {
      Logger.error('Error getting player stats: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getLifetimeStats: async (req, res) => {
    try {
      const {
        modeType,
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      } = PlayersValidator.getLifetimeStats(req);

      const returnObj = await PlayerService.getLifetimeStats({
        modeType,
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Unable to get lifetime stats: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getRecentStats: async (req, res) => {
    try {
      const {
        modeType,
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      } = PlayersValidator.getRecentStats(req);

      const returnObj = await PlayerService.getRecentStats({
        modeType,
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Unable to get recent stats: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  fetchLatestStatsMatches: async (req, res) => {
    try {
      const lastFetchKey = await OptionsHelper.findLastFetch({ key: LAST_DATA_FETCH });

      const lastFetchEpoch = lastFetchKey.value;
      const currentTimeEpoch = new Date().getTime();
      const timeDifferenceMilliseconds = currentTimeEpoch - lastFetchEpoch;
      const timeDifferenceMin = (timeDifferenceMilliseconds / 1000) / 60;

      if (timeDifferenceMin < 10) {
        return res.status(400).json(new MazzError().addParamError('Last fetch less than 10 minutes'));
      }

      fetchUserStatsTask();

      return res.status(200).json({ success: true });
    } catch (error) {
      Logger.error('Unable to fetch latest stats and matches: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getWeekMonthStats: async (req, res) => {
    try {
      const {
        modeType,
        monthFilter,
        page,
        pageSize,
        players,
        singlePlayer,
        sortColumn,
        sortDir,
      } = PlayersValidator.getWeekMonthStats(req);

      const returnObj = await PlayerService.getWeekMonthStats({
        modeType,
        monthFilter,
        page,
        pageSize,
        players,
        singlePlayer,
        sortColumn,
        sortDir,
      });

      return res.status(200).json(returnObj);
    } catch (error) {
      Logger.error('Unable to fetch week/month stats: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
  getAwards: async (req, res) => {
    try {
      const {
        monthFilter,
        players,
      } = PlayersValidator.getAwards(req);

      const awardsData = await PlayerService.getAwards({
        monthFilter,
        players,
      });

      if (!isNllOrUnd(awardsData.success)) {
        return res.status(400).json(awardsData);
      }

      const parsedData = PlayerService.parseAwardsData(awardsData);

      return res.status(200).json(parsedData);
    } catch (error) {
      Logger.error('Unable to get awards: ', error);
      return res.status(500).json(new MazzError().addServerError(error.message));
    }
  },
};

module.exports = PatrolMan.patrol('players', PlayerController);
