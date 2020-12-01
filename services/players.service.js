// Utils
const { arrayToRedisKey, replaceTemplateStrings } = require('../utils/tools');
const CommonHelpers = require('../utils/commonHelpers');
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');
const Tools = require('../utils/tools');

// Mongo Helpers
const MatchesHelpers = require('../mongo/helpers/matches.helper');
const PlayerStatsHelper = require('../mongo/helpers/playerStats.helper');
const RecentMatchStatsHelper = require('../mongo/helpers/recentMatchStats.helper');

// Query Objects
const { GET_WEEK_MONTH_STATS } = require('../mongo/queryObjects/monthlyStats.query');

// Redis
const { WEEK_MONTH_STATS } = require('../redis/keys');

const PlayersService = {
  savePlayerStats: async (gamertag, playerStats) => {
    try {
      if (isNllOrUnd(playerStats) || isNllOrUnd(playerStats.lifetime)) {
        return {};
      }

      const { mode } = playerStats.lifetime;
      const modeArr = Tools.loopOverJson(mode);

      if (isNllOrUnd(modeArr)) {
        return {};
      }

      const saveModeArr = [];
      modeArr.map((modeItem) => {
        if (modeItem.key === 'br_all' || modeItem.key === 'br' || modeItem.key === 'br_dmz') {
          const playerStatsObj = CommonHelpers.createPlayersStatsObj(gamertag, modeItem);
          return saveModeArr.push(PlayerStatsHelper
            .upsertByGamertagModeType(
              {
                gamertag,
                modeType: playerStatsObj.modeType,
              },
              playerStatsObj,
            ));
        }
        return null;
      });

      await Promise.allSettled(saveModeArr);

      return {};
    } catch (error) {
      Logger.error('Error getting player stats: ', error);
      return { success: false, error: error.message };
    }
  },
  getLifetimeStats: async (reqObj) => {
    try {
      const {
        modeType,
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      } = reqObj;

      let sortOrder = -1;
      if (sortDir === 'asc') {
        sortOrder = 1;
      }

      const aggregateObj = [
        {
          $lookup: {
            localField: 'gamertag',
            foreignField: 'playerName',
            from: 'matches',
            as: 'playerMatches',
          },
        },
        {
          $unwind: '$playerMatches',
        },
        {
          $match: {
            modeType: 'Battle Royal',
          },
        },
        {
          $group: {
            _id: '$gamertag',
            data: {
              $last: '$$ROOT',
            },
            count: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $ne: ['$playerMatches.stats.ocaScore', null],
                      },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
            ocaScore: {
              $sum: '$playerMatches.stats.ocaScore',
            },
            highestOcaScore: {
              $max: '$playerMatches.stats.ocaScore',
            },
          },
        },
        {
          $project: {
            gamertag: '$data.gamertag',
            modeType: '$data.modeType',
            cash: '$data.cash',
            contracts: '$data.contracts',
            createdAt: '$data.createdAt',
            deaths: '$data.deaths',
            downs: '$data.downs',
            gamesPlayed: '$data.gamesPlayed',
            kdRatio: '$data.kdRatio',
            kills: '$data.kills',
            revives: '$data.revives',
            score: '$data.score',
            scorePerMinute: '$data.scorePerMinute',
            timePlayed: '$data.timePlayed',
            topFive: '$data.topFive',
            topTen: '$data.topTen',
            topTwentyFive: '$data.topTwentyFive',
            updatedAt: '$data.updatedAt',
            wins: '$data.wins',
            ocaGames: '$count',
            sumOcaScore: '$ocaScore',
            avgOcaScore: {
              $divide: ['$ocaScore', '$count'],
            },
            highestOcaScore: '$highestOcaScore',
            winPercent: {
              $divide: ['$data.wins', '$data.gamesPlayed'],
            },
            killsPerGame: {
              $divide: ['$data.kills', '$data.gamesPlayed'],
            },
            downsPerGame: {
              $divide: ['$data.downs', '$data.gamesPlayed'],
            },
            topFivePercent: {
              $divide: ['$data.topFive', '$data.gamesPlayed'],
            },
            topTenPercent: {
              $divide: ['$data.topTen', '$data.gamesPlayed'],
            },
          },
        },
        {
          $sort: {
            [sortColumn]: sortOrder,
          },
        },
        {
          $skip: (page - 1) * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];

      if (modeType === 'br') {
        aggregateObj[2].$match.modeType = 'Battle Royal';
      } else if (modeType === 'plunder') {
        aggregateObj[2].$match.modeType = 'Plunder';
      } else {
        aggregateObj[2].$match.modeType = 'All';
      }

      if (players !== undefined) {
        aggregateObj[2].$match.gamertag = { $in: players };
      }

      const aggregateResponse = await PlayerStatsHelper.aggregateAndCount(aggregateObj);

      return { success: true, stats: aggregateResponse.rows, totalCount: aggregateResponse.count };
    } catch (error) {
      Logger.error('Error getting lifetime stats: ', error);
      return { success: false, error: error.message };
    }
  },
  getRecentStats: async (reqObj) => {
    try {
      const {
        page,
        pageSize,
        players,
        sortColumn,
        sortDir,
      } = reqObj;

      let sortOrder = -1;
      if (sortDir === 'asc') {
        sortOrder = 1;
      }

      const aggregateObj = [
        {
          $match: {
            modeType: {
              $ne: 'All',
            },
          },
        },
        {
          $sort: {
            [sortColumn]: sortOrder,
          },
        },
        {
          $skip: (page - 1) * pageSize,
        },
        {
          $limit: pageSize,
        },
      ];

      if (players !== undefined) {
        aggregateObj[0].$match.gamertag = { $in: players };
      }

      const aggregateResponse = await RecentMatchStatsHelper.aggregateAndCount(aggregateObj);

      return { success: true, stats: aggregateResponse.rows, totalCount: aggregateResponse.count };
    } catch (error) {
      Logger.error('Error getting lifetime stats: ', error);
      return { success: false, error: error.message };
    }
  },
  getWeekMonthStats: async (reqObj) => {
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
      } = reqObj;

      let sortOrder = -1;
      if (sortDir === 'asc') {
        sortOrder = 1;
      }

      const aggregateParams = {
        '%PAGE%': (page - 1) * pageSize,
        '%PAGE_SIZE%': pageSize,
        '%SORT_COLUMN%': sortColumn,
        '%SORT_ORDER%': sortOrder,
      };

      let redisKey = WEEK_MONTH_STATS;

      const aggregateObj = replaceTemplateStrings(GET_WEEK_MONTH_STATS, aggregateParams);

      if (modeType === 'solos' || modeType === 'duos' || modeType === 'threes' || modeType === 'quads') {
        if (modeType === 'solos') {
          aggregateObj[0].$match.modeType = 'Battle Royal Solos';
        } else if (modeType === 'duos') {
          aggregateObj[0].$match.modeType = 'Battle Royal Duos';
        } else if (modeType === 'threes') {
          aggregateObj[0].$match.modeType = 'Battle Royal Threes';
        } else if (modeType === 'quads') {
          aggregateObj[0].$match.modeType = 'Battle Royal Quads';
        }

        redisKey = `${redisKey}-${modeType}`;
      }

      // If singlePlayer && !monthFilter, then get month by month stats for player
      if (!isNllOrUnd(singlePlayer)) {
        aggregateObj[0].$match.playerName = singlePlayer;
        aggregateObj[2].$group._id = {
          month: '$month',
          year: '$year',
        };

        if (sortColumn === 'monthYear') {
          aggregateObj[4].$sort = {
            month: sortOrder,
            year: sortOrder,
          };
        }

        redisKey = `${redisKey}-singlePlayer-${singlePlayer}`;
      } else {
        if (!isNllOrUnd(monthFilter)) {
          let ltMonth = new Date(`${parseInt(monthFilter.year, 10)}-${(parseInt(monthFilter.month, 10) + 1)}-01`);
          if (monthFilter.month === '12') {
            console.log(`${parseInt(monthFilter.year, 10) + 1}-01-01`);
            ltMonth = new Date(`${parseInt(monthFilter.year, 10) + 1}-01-01`)
          }

          aggregateObj[0].$match.matchTime = {
            $gte: new Date(`${parseInt(monthFilter.year, 10)}-${parseInt(monthFilter.month, 10)}-01`),
            $lt: ltMonth,
          };
          redisKey = `${redisKey}-month-${monthFilter.month}-year-${monthFilter.year}`;
        }

        if (!isNllOrUnd(players)) {
          aggregateObj[0].$match.playerName = { $in: players };
          redisKey = `${redisKey}-${arrayToRedisKey(players)}`;
        }
      }

      redisKey = `${redisKey}-${page - 1}-${pageSize}-${sortColumn}-${sortOrder}`;

      const usersStats = await MatchesHelpers.fetchWeekMonthStats(aggregateObj, redisKey);

      return { success: true, players: usersStats.rows, totalCount: usersStats.count };
    } catch (error) {
      Logger.error('Error getting week/month stats: ', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = PlayersService;
