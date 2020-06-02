module.exports.GET_MATCHES_QUERY = [
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
    $skip: '%PAGE%',
  },
  {
    $limit: '%PAGE_SIZE%',
  },
];