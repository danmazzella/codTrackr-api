// Utilities
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');
const Validator = require('../utils/validator');

const MatchesValidator = {
  getMatches: (req) => {
    const {
      modeType: _modeType,
      page: _page,
      pageSize: _pageSize,
      players: _players,
    } = req.query;

    let modeType = _modeType;
    let page = Tools.toInteger(_page);
    let pageSize = Tools.toInteger(_pageSize);
    let players = Tools.toArray(_players);

    if (!Validator.isValidId(page)) {
      page = 1;
    }

    if (!Validator.isValidId(pageSize)) {
      pageSize = 25;
    }

    if (!Validator.isValidString(modeType)) {
      modeType = 'all';
    }

    if (!Array.isArray(players)) {
      players = undefined;
    }

    return {
      modeType,
      page,
      pageSize,
      players,
    };
  },
  getTopFiveGames: (req) => {
    const {
      monthFilter: _monthFilter,
      page: _page,
      pageSize: _pageSize,
      players: _players,
    } = req.query;

    let monthFilter = Tools.toJson(_monthFilter);
    let page = Tools.toInteger(_page);
    let pageSize = Tools.toInteger(_pageSize);
    let players = Tools.toArray(_players);

    if (!Validator.isValidObject(monthFilter) || (monthFilter.month < 1 || monthFilter.month > 12) || (monthFilter.year < 2020 || monthFilter.year > 2021)) {
      monthFilter = undefined;
    }

    if (!Validator.isValidId(page)) {
      page = 1;
    }

    if (!Validator.isValidId(pageSize)) {
      pageSize = 25;
    }

    if (!Array.isArray(players)) {
      players = undefined;
    }

    return {
      monthFilter,
      page,
      pageSize,
      players,
    };
  },
  getMatch: (req) => {
    const {
      matchId: _matchId,
    } = req.params;

    const {
      gamertag: _gamertag,
    } = req.query;

    const matchId = _matchId;
    const gamertag = _gamertag;

    const mazzError = new MazzError(400);

    if (Validator.isNullOrUndefined(matchId)) {
      mazzError.addParamError('Missing or invalid matchId');
    }

    if (Validator.isNullOrUndefined(gamertag)) {
      mazzError.addParamError('Missing or invalid gamertag');
    }

    return {
      gamertag,
      matchId,
      mazzError,
    };
  },
};

module.exports = MatchesValidator;