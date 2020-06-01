// NPM Modules
const mongoose = require('mongoose');

// Model
const Players = mongoose.model('Players');

// Utils
const { isNllOrUnd } = require('../../utils/validator');
const Logger = require('../../utils/winston');

// Redis
const { getAsync, redisClient } = require('../../redis/redis');
const { ALL_PLAYERS } = require('../../redis/keys');

const PlayersHelpers = {
  addNewPlayer: obj => new Promise((resolve) => {
    const newMatch = new Players(obj);

    newMatch
      .save()
      .then((data) => {
        redisClient.del(ALL_PLAYERS);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
  findOnePlayerByGamertag: (obj, opts = {}, sort = {}) => new Promise((resolve) => {
    Players
      .findOne(obj, opts, sort)
      .then(data => resolve(data))
      .catch(err => resolve(err));
  }),
  findAllPlayers: (obj, project = {}, opt = {}) => new Promise(async (resolve) => {
    const players = await getAsync(ALL_PLAYERS);

    if (!isNllOrUnd(players)) {
      try {
        const jsonPlayers = JSON.parse(players);

        if (jsonPlayers.length > 0) {
          return resolve(jsonPlayers);
        }
      } catch (error) {
        Logger.error('Unable to parse redis key: ', ALL_PLAYERS);
      }
    }

    return Players
      .find(obj, project, opt)
      .then((data) => {
        redisClient.set(ALL_PLAYERS, JSON.stringify(data));
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = PlayersHelpers;
