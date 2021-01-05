module.exports.GET_AWARDS = [
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
      numMatches: {
        $sum: 1,
      },
      totalKills: {
        $sum: '$stats.kills',
      },
      totalTimePlayed: {
        $sum: '$stats.timePlayedSeconds',
      },
      score: {
        $sum: '$stats.score',
      },
      totalHeadshots: {
        $sum: '$stats.headshots',
      },
      totalExecutions: {
        $sum: '$stats.executions',
      },
      percentTimeMoving: {
        $sum: '$stats.percentTimeMoving',
      },
      damageDone: {
        $sum: '$stats.damageDone',
      },
      damageTaken: {
        $sum: '$stats.damageTaken',
      },
      distanceTraveled: {
        $sum: '$stats.distanceTraveled',
      },
      deaths: {
        $sum: '$stats.deaths',
      },
      assists: {
        $sum: '$stats.assists',
      },
      cachesOpened: {
        $sum: '$stats.cachesOpened',
      },
      revives: {
        $sum: '$stats.revives',
      },
      ocaScore: {
        $sum: '$stats.ocaScore',
      },
      kioskBuys: {
        $sum: '$stats.kioskBuys',
      },
      downs: {
        $sum: {
          $add: [
            '$stats.downsInCircleOne',
            '$stats.downsInCircleTwo',
            '$stats.downsInCircleThree',
            '$stats.downsInCircleFour',
            '$stats.downsInCircleFive',
            '$stats.downsInCircleSix',
          ],
        },
      },
      highestKills: {
        $max: '$stats.kills',
      },
      highestTimePlayed: {
        $max: '$stats.timePlayedSeconds',
      },
      highestScore: {
        $max: '$stats.score',
      },
      highestHeadshots: {
        $max: '$stats.headshots',
      },
      highestExecutions: {
        $max: '$stats.executions',
      },
      highestTimeMoving: {
        $max: '$stats.percentTimeMoving',
      },
      highestDamageDone: {
        $max: '$stats.damageDone',
      },
      highestDamageTaken: {
        $max: '$stats.damageTaken',
      },
      highestDistanceTraveled: {
        $max: '$stats.distanceTraveled',
      },
      highestDeaths: {
        $max: '$stats.deaths',
      },
      highestAssists: {
        $max: '$stats.assists',
      },
      highestCachesOpened: {
        $max: '$stats.cachesOpened',
      },
      highestRevives: {
        $max: '$stats.revives',
      },
      highestOcaScore: {
        $max: '$stats.ocaScore',
      },
      highestKioskBuys: {
        $max: '$stats.kioskBuys',
      },
      highestDowns: {
        $max: {
          $add: [
            '$stats.downsInCircleOne',
            '$stats.downsInCircleTwo',
            '$stats.downsInCircleThree',
            '$stats.downsInCircleFour',
            '$stats.downsInCircleFive',
            '$stats.downsInCircleSix',
          ],
        },
      },
    },
  },
  {
    $project: {
      playerName: '$_id',
      numMatches: 1,
      avgKills: {
        $divide: ['$totalKills', '$numMatches'],
      },
      avgTimePlayed: {
        $divide: ['$totalTimePlayed', '$numMatches'],
      },
      avgScore: {
        $divide: ['$score', '$numMatches'],
      },
      avgHeadshots: {
        $divide: ['$totalHeadshots', '$numMatches'],
      },
      avgExecutions: {
        $divide: ['$totalExecutions', '$numMatches'],
      },
      avgTimeMoving: {
        $divide: ['$percentTimeMoving', '$numMatches'],
      },
      avgDamageDone: {
        $divide: ['$damageDone', '$numMatches'],
      },
      avgDamageTaken: {
        $divide: ['$damageTaken', '$numMatches'],
      },
      avgDistanceTraveled: {
        $divide: ['$distanceTraveled', '$numMatches'],
      },
      avgDeaths: {
        $divide: ['$deaths', '$numMatches'],
      },
      avgAssists: {
        $divide: ['$assists', '$numMatches'],
      },
      avgCachesOpened: {
        $divide: ['$cachesOpened', '$numMatches'],
      },
      avgRevives: {
        $divide: ['$revives', '$numMatches'],
      },
      avgOcaScore: {
        $divide: ['$ocaScore', '$numMatches'],
      },
      avgKioskBuys: {
        $divide: ['$kioskBuys', '$numMatches'],
      },
      avgDowns: {
        $divide: ['$downs', '$numMatches'],
      },
      highestKills: 1,
      highestTimePlayed: 1,
      highestScore: 1,
      highestHeadshots: 1,
      highestExecutions: 1,
      highestTimeMoving: 1,
      highestDamageDone: 1,
      highestDamageTaken: 1,
      highestDistanceTraveled: 1,
      highestDeaths: 1,
      highestAssists: 1,
      highestCachesOpened: 1,
      highestRevives: 1,
      highestOcaScore: 1,
      highestKioskBuys: 1,
      highestDowns: 1,
    },
  },
];
