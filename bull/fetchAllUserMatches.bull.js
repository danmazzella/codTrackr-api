// Bull
const Bull = require('./bull').fetchAllUserMatchesQueue;

// Utils
const CODAPI = require('../utils/cod-api');
const { isNllOrUnd } = require('../utils/validator');
const Logger = require('../utils/winston');

// Helpers

// Services
const MatchesService = require('../services/matches.service');

const fetchAllUserMatches = reqBody => new Promise((resolve) => {
  const fetchAllUserMatchesJob = Bull.add(reqBody);

  return resolve(fetchAllUserMatchesJob);
});

Bull.process(async (job, done) => {
  try {
    const {
      gamertag,
      platform,
      startTime,
      endTime,
    } = job.data;

    Logger.debug('Fetch all matches job processing', { date: new Date(), gamertag, endTime: new Date(endTime) });

    const matches = await CODAPI.warzoneDateRangeMatches(gamertag, startTime, endTime, platform);

    if (isNllOrUnd(matches) || isNllOrUnd(matches.matches)) {
      Logger.debug('No matches for user:', gamertag);
      return done();
    }

    const matchesArray = matches.matches;

    // If length == 20, then call recursively with last items startTime
    matchesArray.sort((matchOne, matchTwo) => {
      if (matchOne.matchTime > matchTwo.matchTime) {
        return -1;
      }

      return 1;
    });

    const lastMatch = matchesArray[matchesArray.length - 1];
    const lastMatchStartTime = lastMatch.utcStartSeconds;

    Bull.add({
      gamertag,
      platform,
      startTime: 1581196358000,
      endTime: lastMatchStartTime * 1000,
    });

    // Save each match to the database
    await MatchesService.saveMatchesForUser(gamertag, matchesArray);

    Logger.info('Fetch all matches complete!', { success: true, gamertag });
    return done();
  } catch (error) {
    Logger.error('Error while completing CallDetails', error);

    return done();
  }
});

module.exports = fetchAllUserMatches;
