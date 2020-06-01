const MazzError = require('../utils/mazzErrors');

module.exports = (req, res, next) => {
  if (req.currentUser.isAdmin === true) {
    return next();
  }

  const paramErrors = new MazzError(403);
  paramErrors.addPermError('Invalid Admin Permission');
  return res.status(paramErrors.code).json(paramErrors);
};
