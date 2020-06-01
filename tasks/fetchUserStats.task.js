// Bull
const fetchUserStats = require('../bull/fetchUserStats.bull');

// Utils
const Logger = require('../utils/winston');

// Mongo Helpers
const PlayerHelpers = require('../mongo/helpers/players.helper');

module.exports = async () => {
  // Fetch all the users
  const players = await PlayerHelpers.findAllPlayers({});

  // For each player
  players.map((player) => {
    Logger.info(`Call fetch for ${player.name} at: ${new Date()}`);
    // Add them all to the bull job
    return fetchUserStats({
      userName: player.gamertag,
    });
  });
};
