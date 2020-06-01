// Bull
const Bull = require('./bull').fetchUserStatsQueue;

// Datatypes
const { LAST_DATA_FETCH } = require('../datatypes/options.datatypes');

// Utils
const CODAPI = require('../utils/cod-api');
const Logger = require('../utils/winston');
const Tools = require('../utils/tools');

// Helpers
const OptionsHelper = require('../mongo/helpers/options.helper');
const PlayerHelpers = require('../mongo/helpers/players.helper');

// Services
const MatchesService = require('../services/matches.service');
const PlayerService = require('../services/players.service');

// Socket
const IO = require('../sockets/sockets');

// Constant
let finishedTimeout;

const fetchUserStats = reqBody => new Promise((resolve) => {
  const fetchUserStatsJob = Bull.add(reqBody);

  return resolve(fetchUserStatsJob);
});

Bull.process(async (job, done) => {
  try {
    const { userName } = job.data;

    clearTimeout(finishedTimeout);

    Logger.debug('\n\nFetch all users stats job processing', { date: new Date(), gamertag: userName });
    IO.emit('fetchingData', userName);

    OptionsHelper.upsertLastFetch(
      {
        key: LAST_DATA_FETCH,
      },
      {
        key: LAST_DATA_FETCH,
        value: new Date().getTime(),
      },
    );

    const playerObj = await PlayerHelpers.findOnePlayerByGamertag({ gamertag: Tools.lowerCaseRegex(userName, true) });

    const playerStats = await CODAPI.getMPStats(userName, playerObj.platform);

    await PlayerService.savePlayerStats(userName, playerStats);

    const matchesRaw = await CODAPI.warzoneLatestMatches(userName, playerObj.platform);

    await MatchesService.saveRecentMatchStats(userName, matchesRaw);

    const matchesArray = matchesRaw.matches;

    if (matchesArray === null) {
      Logger.debug('Matches array was null');
      return done();
    }

    await MatchesService.saveMatchesForUser(userName, matchesArray);

    Logger.info('Fetch all users stats complete!', { success: true, gamertag: userName }, '\n\n');

    finishedTimeout = setTimeout(() => {
      IO.emit('fetchingData', '');
    }, 500);

    return done();
  } catch (error) {
    Logger.error('Error while completing CallDetails', error);

    return done();
  }
});

module.exports = fetchUserStats;
