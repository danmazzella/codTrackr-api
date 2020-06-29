module.exports.GET_WEEK_MONTH_STATS = [
  {
    $match: {
      'stats.ocaScore': {
        $ne: null,
      },
    },
  },
  {
    $group: {
      _id: '$playerName',
      count: {
        $sum: 1,
      },
      totalPlacements: {
        $sum: '$placement',
      },
      wins: {
        $sum: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$placement', 1] },
                then: 1,
              },
            ],
            default: 0,
          },
        },
      },
      topTen: {
        $sum: {
          $switch: {
            branches: [
              {
                case: { $lte: ['$placement', 10] },
                then: 1,
              },
            ],
            default: 0,
          },
        },
      },
      topFive: {
        $sum: {
          $switch: {
            branches: [
              {
                case: { $lte: ['$placement', 5] },
                then: 1,
              },
            ],
            default: 0,
          },
        },
      },
      timePlayed: {
        $sum: '$stats.timePlayedSeconds',
      },
      kills: {
        $sum: '$stats.kills',
      },
      headshots: {
        $sum: '$stats.headshots',
      },
      percentTimeMoving: {
        $sum: '$stats.percentTimeMoving',
      },
      damageDone: {
        $sum: '$stats.damageDone',
      },
      distanceTraveled: {
        $sum: '$stats.distanceTraveled',
      },
      deaths: {
        $sum: '$stats.deaths',
      },
      damageTaken: {
        $sum: '$stats.damageTaken',
      },
      teamSurvivalTime: {
        $sum: '$stats.teamSurvivalTime',
      },
      gulagDeaths: {
        $sum: '$stats.gulagDeaths',
      },
      gulagKills: {
        $sum: '$stats.gulagKills',
      },
      cachesOpened: {
        $sum: '$stats.cachesOpened',
      },
      teamsWiped: {
        $sum: '$stats.teamsWiped',
      },
      lastStandKills: {
        $sum: '$stats.lastStandKills',
      },
      revives: {
        $sum: '$stats.revives',
      },
      kioskBuys: {
        $sum: '$stats.kioskBuys',
      },
      downsInCircleOne: {
        $sum: '$stats.downsInCircleOne',
      },
      downsInCircleTwo: {
        $sum: '$stats.downsInCircleTwo',
      },
      downsInCircleThree: {
        $sum: '$stats.downsInCircleThree',
      },
      downsInCircleFour: {
        $sum: '$stats.downsInCircleFour',
      },
      downsInCircleFive: {
        $sum: '$stats.downsInCircleFive',
      },
      downsInCircleSix: {
        $sum: '$stats.downsInCircleSix',
      },
      ocaScore: {
        $sum: '$stats.ocaScore',
      },
    },
  },
  {
    $project: {
      playerName: '$_id',
      gamesPlayed: '$count',
      totalPlacements: 1,
      wins: 1,
      winPercent: {
        $divide: ['$wins', '$count'],
      },
      topTen: 1,
      avgTopTen: {
        $divide: ['$topTen', '$count'],
      },
      topFive: 1,
      avgTopFive: {
        $divide: ['$topFive', '$count'],
      },
      timePlayed: 1,
      avgTimePlayed: {
        $divide: ['$timePlayed', '$count'],
      },
      kills: 1,
      killsPerGame: {
        $divide: ['$kills', '$count'],
      },
      deaths: 1,
      deathsPerGame: {
        $divide: ['$deaths', '$count'],
      },
      killDeathRatio: {
        $cond: {
          if: {
            $gt: [
              '$deaths',
              0,
            ],
          },
          then: {
            $divide: [
              '$kills',
              '$deaths',
            ],
          },
          else: 0,
        },
      },
      percentTimeMoving: 1,
      avgTimeMoving: {
        $divide: ['$percentTimeMoving', '$count'],
      },
      damageDone: 1,
      avgDamageDone: {
        $divide: ['$damageDone', '$count'],
      },
      damageTaken: 1,
      avgDamageTaken: {
        $divide: ['$damageTaken', '$count'],
      },
      distanceTraveled: 1,
      avgDistanceTraveled: {
        $divide: ['$distanceTraveled', '$count'],
      },
      teamSurvivalTime: 1,
      gulagKills: 1,
      avgGulagKills: {
        $divide: ['$gulagKills', '$count'],
      },
      gulagDeaths: 1,
      avgGulagDeaths: {
        $divide: ['$gulagDeaths', '$count'],
      },
      cachesOpened: 1,
      avgCachesOpened: {
        $divide: ['$cachesOpened', '$count'],
      },
      teamsWiped: 1,
      avgTeamsWiped: {
        $divide: ['$teamsWiped', '$count'],
      },
      lastStandKills: 1,
      avgLastStandKills: {
        $divide: ['$lastStandKills', '$count'],
      },
      revives: 1,
      avgRevives: {
        $divide: ['$revives', '$count'],
      },
      kioskBuys: 1,
      avgKioskBuys: {
        $divide: ['$kioskBuys', '$count'],
      },
      downsInCircleOne: 1,
      avgDownsInCircleOne: {
        $divide: ['$downsInCircleOne', '$count'],
      },
      downsInCircleTwo: 2,
      avgDownsInCircleTwo: {
        $divide: ['$downsInCircleTwo', '$count'],
      },
      downsInCircleThree: 1,
      avgDownsInCircleThree: {
        $divide: ['$downsInCircleThree', '$count'],
      },
      downsInCircleFour: 1,
      avgDownsInCircleFour: {
        $divide: ['$downsInCircleFour', '$count'],
      },
      downsInCircleFive: 1,
      avgDownsInCircleFive: {
        $divide: ['$downsInCircleFive', '$count'],
      },
      downsInCircleSix: 1,
      avgDownsInCircleSix: {
        $divide: ['$downsInCircleSix', '$count'],
      },
      totalDowns: {
        $add: [
          '$downsInCircleOne',
          '$downsInCircleTwo',
          '$downsInCircleThree',
          '$downsInCircleFour',
          '$downsInCircleFive',
          '$downsInCircleSix',
        ],
      },
      avgDowns: {
        $divide: [
          {
            $add: [
              '$downsInCircleOne',
              '$downsInCircleTwo',
              '$downsInCircleThree',
              '$downsInCircleFour',
              '$downsInCircleFive',
              '$downsInCircleSix',
            ],
          },
          '$count',
        ],
      },
      ocaScore: 1,
      avgOcaScore: {
        $divide: ['$ocaScore', '$count'],
      },
    },
  },
  {
    $sort: {
      ['%SORT_COLUMN%']: '%SORT_ORDER%', // eslint-disable-line
    },
  },
  {
    $skip: '%PAGE%',
  },
  {
    $limit: '%PAGE_SIZE%',
  },
];
