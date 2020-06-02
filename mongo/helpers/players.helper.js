// NPM Modules
const mongoose = require('mongoose');

// Model
const Players = mongoose.model('Players');

// Utils
const { isNllOrUnd } = require('../../utils/validator');

// Redis
const { deleteFromRedis, getFromRedis, setInRedis } = require('../../redis/redis.helpers');
const { ALL_PLAYERS } = require('../../redis/keys');

const PlayersHelpers = {
  addNewPlayer: obj => new Promise((resolve) => {
    const newMatch = new Players(obj);

    newMatch
      .save()
      .then((data) => {
        deleteFromRedis(ALL_PLAYERS);
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
    const players = await getFromRedis(ALL_PLAYERS);

    if (!isNllOrUnd(players)) {
      return resolve(players);
    }

    return Players
      .find(obj, project, opt)
      .then((data) => {
        setInRedis(ALL_PLAYERS, data);
        return resolve(data);
      })
      .catch(err => resolve(err));
  }),
};


module.exports = PlayersHelpers;
