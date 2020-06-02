// Utils
const CommonHelpers = require('../utils/commonHelpers');
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');

// Validator

// Mongo Helpers
const MatchesHelper = require('../mongo/helpers/matches.helper');
const MatchTeamsHelper = require('../mongo/helpers/matchTeams.helper');
const RecentMatchStatsHelper = require('../mongo/helpers/recentMatchStats.helper');

const MatchesService = {
  getMatches: async (reqObj) => {
    try {
      const {
        modeType,
        page,
        pageSize,
        players,
      } = reqObj;

      const aggregateObj = [
        {
          $match: {
            placement: {
              $ne: null,
            },
          },
        },
        {
          $project: {
            matchId: 1,
            playerName: 1,
            createdAt: 1,
            mapName: 1,
            matchDuration: 1,
            matchTime: 1,
            modeType: 1,
            placement: 1,
            playerCount: 1,
            stats: 1,
            updatedAt: 1,
            players: 1,
          },
        },
        {
          $group: {
            _id: '$matchId',
            modeType: {
              $last: '$modeType',
            },
            matchTime: {
              $last: '$matchTime',
            },
            matchDuration: {
              $last: '$matchDuration',
            },
            placement: {
              $last: '$placement',
            },
            matches: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $sort: {
            matchTime: -1,
          },
        },
        {
          $skip: (page - 1) * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];

      if (modeType === 'solos') {
        aggregateObj[0].$match.modeType = 'Battle Royal Solos';
      } else if (modeType === 'duos') {
        aggregateObj[0].$match.modeType = 'Battle Royal Duos';
      } else if (modeType === 'threes') {
        aggregateObj[0].$match.modeType = 'Battle Royal Threes';
      } else if (modeType === 'quads') {
        aggregateObj[0].$match.modeType = 'Battle Royal Quads';
      }

      if (players !== undefined) {
        aggregateObj[0].$match.playerName = { $in: players };
      }

      const aggregateResponse = await MatchesHelper.aggregateAndCount(aggregateObj);

      return { success: true, matches: aggregateResponse.rows, totalCount: aggregateResponse.count };
    } catch (error) {
      Logger.error('Error getting matches ', error);
      return { success: false, error: new MazzError().addServerError(error.message) };
    }
  },
  saveRecentMatchStats: async (gamertag, matches) => {
    try {
      const { summary } = matches;

      if (isNllOrUnd(summary)) {
        return {};
      }

      await RecentMatchStatsHelper.deleteByGamertag({
        gamertag,
      });

      const summaryArr = Tools.loopOverJson(summary);
      const saveSummaryArr = [];
      summaryArr.map((summaryItem) => {
        const recentMatchStatsObj = CommonHelpers.createRecentMatchStatsObj(gamertag, summaryItem);
        return saveSummaryArr.push(RecentMatchStatsHelper
          .upsertByGamertagModeType(
            {
              gamertag,
              modeType: recentMatchStatsObj.modeType,
            },
            recentMatchStatsObj,
          ));
      });

      await Promise.all(saveSummaryArr);

      return {};
    } catch (error) {
      Logger.error('Error getting match stats: ', error);
      return { success: false, error: new MazzError().addServerError(error.message) };
    }
  },
  saveMatchesForUser: async (gamertag, matches) => {
    try {
      if (isNllOrUnd(matches)) {
        Logger.error('saveMatchesForUser - Matches is undefined');
        return {};
      }

      const saveMatchesPromiseArr = [];
      matches.map((match) => {
        const matchObj = CommonHelpers.createMatchObj(gamertag, match);

        if (!isNllOrUnd(matchObj) && !isNllOrUnd(matchObj.success) && matchObj.success === false) {
          return {};
        }

        saveMatchesPromiseArr.push(MatchTeamsHelper
          .upsertByMatchId(
            {
              matchId: matchObj.matchId,
            },
            {
              matchId: matchObj.matchId,
              rankedTeams: match.rankedTeams,
            },
          ));

        return saveMatchesPromiseArr.push(MatchesHelper
          .upsertByMatchIdPlayerName(
            {
              matchId: matchObj.matchId,
              playerName: matchObj.playerName,
            },
            matchObj,
          ));
      });

      await Promise.all(saveMatchesPromiseArr);

      return {};
    } catch (error) {
      Logger.error('Error getting matches ', error);
      return { success: false, error: new MazzError().addServerError(error.message) };
    }
  },
  getTopFiveGames: async (reqObj) => {
    try {
      const {
        monthFilter,
        page,
        pageSize,
        players,
      } = reqObj;

      const aggregateObj = [
        {
          $match: {
            modeType: {
              $in: [
                'Battle Royal Quads',
                'Battle Royal Solos',
                'Battle Royal Threes',
                'Battle Royal Duos',
              ],
            },
          },
        },
        {
          $sort: {
            'stats.ocaScore': -1,
          },
        },
        {
          $group: {
            _id: '$playerName',
            matches: {
              $push: '$$ROOT',
            },
            timePlayed: {
              $sum: '$stats.timePlayedSeconds',
            },
          },
        },
        {
          $project: {
            matches: {
              $slice: ['$matches', 5],
            },
            timePlayed: 1,
          },
        },
        {
          $skip: (page - 1) * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];

      if (!isNllOrUnd(monthFilter)) {
        aggregateObj[0].$match.matchTime = {
          $gte: new Date(`${parseInt(monthFilter.year, 10)}-${parseInt(monthFilter.month, 10)}-01`),
          $lt: new Date(`${parseInt(monthFilter.year, 10)}-${(parseInt(monthFilter.month, 10) + 1)}-01`),
        };
      }

      if (!isNllOrUnd(players)) {
        aggregateObj[0].$match.playerName = { $in: players };
      }

      const userMatches = await MatchesHelper.aggregate(aggregateObj);

      const finalMatchesArray = [];
      userMatches.map((_userMatch) => {
        const userMatch = _userMatch;
        let totalOca = 0;
        userMatch.matches.map(match => (totalOca += match.stats.ocaScore)); // eslint-disable-line no-return-assign
        userMatch.totalOcaScore = totalOca;
        return finalMatchesArray.push(userMatch);
      });

      finalMatchesArray.sort((playerOne, playerTwo) => playerTwo.totalOcaScore - playerOne.totalOcaScore);

      return { success: true, userMatches: finalMatchesArray };
    } catch (error) {
      Logger.error('Error getting top five games: ', error);
      return { success: false, error: new MazzError().addServerError(error.message) };
    }
  },
  getMatch: async (reqObj) => {
    try {
      const {
        gamertag,
        matchId,
      } = reqObj;

      const match = await MatchesHelper.findOneByMatchIdPlayerName({
        playerName: Tools.lowerCaseRegex(gamertag, true),
        matchId,
      });

      return {
        success: true,
        match,
      };
    } catch (error) {
      Logger.error('Error getting match: ', error);
      return { success: false, error: new MazzError().addServerError(error.message) };
    }
  },
};

module.exports = MatchesService;
