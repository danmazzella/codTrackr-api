// Config
const EnvConfig = require('../config/config.environment');

// Utils
const { isNllOrUnd } = require('../utils/validator');
const { getKey } = require('../utils/tools');

module.exports.decryptAPIKey = (req, res, next) => {
  const apiToken = getKey(req, 'headers.authorization');

  if (isNllOrUnd(apiToken)) {
    req.currentUser = {};
    return next();
  }

  if (apiToken !== EnvConfig.admin.apiKey) {
    req.currentUser = {};
    return next();
  }

  req.currentUser = {
    isAdmin: true,
  };
  return next();
};
