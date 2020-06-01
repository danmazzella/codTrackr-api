// NPM Modules
const mongoose = require('mongoose');

// Config
const config = require('../config/config.environment').mongo;

// Utils
const Logger = require('../utils/winston');

mongoose.Promise = global.Promise;

const option = {
  autoIndex: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

mongoose.connect(config.url, option)
  .then(
    () => {
      Logger.info('Mongo Connected', { url: config.url });
    },
    (err) => {
      Logger.error('MongoDB Failed', err);
    },
  );

require('./models/blog.mongo');
require('./models/communityPosts.mongo');
require('./models/matches.mongo');
require('./models/matchTeams.mongo');
require('./models/options.mongo');
require('./models/players.mongo');
require('./models/playerStats.mongo');
require('./models/recentMatchStats.mongo');
