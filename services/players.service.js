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
const { GET_AWARDS } = require('../mongo/queryObjects/awards.query');

// Redis
const { WEEK_MONTH_STATS, AWARDS_KEY } = require('../redis/keys');
const PlayersHelpers = require('../mongo/helpers/players.helper');

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
            year: sortOrder,
            month: sortOrder,
          };
        }

        redisKey = `${redisKey}-singlePlayer-${singlePlayer}`;
      } else {
        if (!isNllOrUnd(monthFilter)) {
          let ltMonth = new Date(`${parseInt(monthFilter.year, 10)}-${(parseInt(monthFilter.month, 10) + 1)}-01`);
          if (monthFilter.month === '12') {
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
  getAwards: async (reqObj) => {
    try {
      const {
        monthFilter,
        players,
      } = reqObj;

      const aggregateParams = {

      };

      let redisKey = AWARDS_KEY;

      const aggregateObj = replaceTemplateStrings(GET_AWARDS, aggregateParams);

      if (!isNllOrUnd(monthFilter)) {
        aggregateObj[0].$match.matchTime = {
          $gte: new Date(`${parseInt(monthFilter.year, 10)}-${parseInt(monthFilter.month, 10)}-01`),
          $lt: new Date(`${parseInt(monthFilter.year, 10)}-${(parseInt(monthFilter.month, 10) + 1)}-01`),
        };
        redisKey = `${redisKey}-month-${monthFilter.month}-year-${monthFilter.year}`;
      }

      if (!isNllOrUnd(players)) {
        aggregateObj[0].$match.playerName = { $in: players };
        redisKey = `${redisKey}-${arrayToRedisKey(players)}`;
      }

      const awardData = await MatchesHelpers.fetchAwards(aggregateObj, redisKey);

      return awardData;
    } catch (error) {
      Logger.error('Error getting awards: ', error);
      return { success: false, error: error.message };
    }
  },
  parseAwardsData: (awardsData) => {
    try {
      const parsedData = {
        information: {
          timePlayed: {
            title: 'No Life?',
            tooltip: 'Amount of time played.',
          },
          kills: {
            title: 'Rambo',
            tooltip: 'Amount of kills',
          },
          score: {
            title: 'Objective Focused',
            tooltip: 'Amount of score (XP)',
          },
          headshots: {
            title: 'The Headhunter',
            tooltip: 'Amount of headshots',
          },
          executions: {
            title: 'The Executioner',
            tooltip: 'Amount of executions',
          },
          damageDone: {
            title: 'The Punisher',
            tooltip: 'Amount of damage done',
          },
          damageTaken: {
            title: 'The Bullet Sponge',
            tooltip: 'Amount of damage taken',
          },
          distanceTraveled: {
            title: 'Carmen Sandiego',
            tooltip: 'Amount of distance traveled',
          },
          deaths: {
            title: 'Trouble staying alive?',
            tooltip: 'Amount of deaths',
          },
          assists: {
            title: 'Staying engaged',
            tooltip: 'Amount of assists',
          },
          cachesOpened: {
            title: 'The Big Loot-owski',
            tooltip: 'Amount of caches opened',
          },
          revives: {
            title: 'Team Medic',
            tooltip: 'Amount of revives',
          },
          ocaScore: {
            title: 'Well-Balanced',
            tooltip: 'OcaScore',
          },
          kioskBuys: {
            title: 'Shopaholic',
            tooltip: 'Amount of kiosk buys',
          },
          downs: {
            title: 'Knock-Out Punches',
            tooltip: 'Amount of downs',
          },
        },
        highest: {
          timePlayed: [],
          kills: [],
          score: [],
          headshots: [],
          executions: [],
          timeMoving: [],
          damageDone: [],
          damageTaken: [],
          distanceTraveled: [],
          deaths: [],
          assists: [],
          cachesOpened: [],
          revives: [],
          ocaScore: [],
          kioskBuys: [],
          downs: [],
        },
        average: {
          timePlayed: [],
          kills: [],
          score: [],
          headshots: [],
          executions: [],
          timeMoving: [],
          damageDone: [],
          damageTaken: [],
          distanceTraveled: [],
          deaths: [],
          assists: [],
          cachesOpened: [],
          revives: [],
          ocaScore: [],
          kioskBuys: [],
          downs: [],
        },
      };

      awardsData.rows.forEach((data) => {
        parsedData.highest.kills.push({
          player: data.playerName,
          data: data.highestKills,
        });
        parsedData.highest.timePlayed.push({
          player: data.playerName,
          data: data.totalTimePlayed,
        });
        parsedData.highest.score.push({
          player: data.playerName,
          data: data.highestScore,
        });
        parsedData.highest.headshots.push({
          player: data.playerName,
          data: data.highestHeadshots,
        });
        parsedData.highest.executions.push({
          player: data.playerName,
          data: data.highestExecutions,
        });
        parsedData.highest.timeMoving.push({
          player: data.playerName,
          data: data.highestTimeMoving,
        });
        parsedData.highest.damageDone.push({
          player: data.playerName,
          data: data.highestDamageDone,
        });
        parsedData.highest.damageTaken.push({
          player: data.playerName,
          data: data.highestDamageTaken,
        });
        parsedData.highest.distanceTraveled.push({
          player: data.playerName,
          data: data.highestDistanceTraveled,
        });
        parsedData.highest.deaths.push({
          player: data.playerName,
          data: data.highestDeaths,
        });
        parsedData.highest.assists.push({
          player: data.playerName,
          data: data.highestAssists,
        });
        parsedData.highest.cachesOpened.push({
          player: data.playerName,
          data: data.highestCachesOpened,
        });
        parsedData.highest.revives.push({
          player: data.playerName,
          data: data.highestRevives,
        });
        parsedData.highest.ocaScore.push({
          player: data.playerName,
          data: data.highestOcaScore,
        });
        parsedData.highest.kioskBuys.push({
          player: data.playerName,
          data: data.highestKioskBuys,
        });
        parsedData.highest.downs.push({
          player: data.playerName,
          data: data.highestDowns,
        });
        parsedData.average.kills.push({
          player: data.playerName,
          data: data.avgKills,
        });
        parsedData.average.timePlayed.push({
          player: data.playerName,
          data: data.avgTimePlayed,
        });
        parsedData.average.score.push({
          player: data.playerName,
          data: data.avgScore,
        });
        parsedData.average.headshots.push({
          player: data.playerName,
          data: data.avgHeadshots,
        });
        parsedData.average.executions.push({
          player: data.playerName,
          data: data.avgExecutions,
        });
        parsedData.average.timeMoving.push({
          player: data.playerName,
          data: data.avgTimeMoving,
        });
        parsedData.average.damageDone.push({
          player: data.playerName,
          data: data.avgDamageDone,
        });
        parsedData.average.damageTaken.push({
          player: data.playerName,
          data: data.avgDamageTaken,
        });
        parsedData.average.distanceTraveled.push({
          player: data.playerName,
          data: data.avgDistanceTraveled,
        });
        parsedData.average.deaths.push({
          player: data.playerName,
          data: data.avgDeaths,
        });
        parsedData.average.assists.push({
          player: data.playerName,
          data: data.avgAssists,
        });
        parsedData.average.cachesOpened.push({
          player: data.playerName,
          data: data.avgCachesOpened,
        });
        parsedData.average.revives.push({
          player: data.playerName,
          data: data.avgRevives,
        });
        parsedData.average.ocaScore.push({
          player: data.playerName,
          data: data.avgOcaScore,
        });
        parsedData.average.kioskBuys.push({
          player: data.playerName,
          data: data.avgKioskBuys,
        });
        parsedData.average.downs.push({
          player: data.playerName,
          data: data.avgDowns,
        });
      });

      const parsedSortedData = {
        information: parsedData.information,
        highest: {},
        average: {},
      };
      Object.keys(parsedData.highest).forEach((dataIdx) => {
        parsedSortedData.highest[dataIdx] = parsedData.highest[dataIdx].sort((objA, objB) => objB.data - objA.data);
      });
      Object.keys(parsedData.average).forEach((dataIdx) => {
        parsedSortedData.average[dataIdx] = parsedData.average[dataIdx].sort((objA, objB) => objB.data - objA.data);
      });

      return parsedSortedData;
    } catch (error) {
      Logger.error('Error getting awards parsedData: ', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = PlayersService;
