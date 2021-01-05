// Utilities
const { isNllOrUnd } = require('../utils/validator');
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
      topTen: _topTen,
    } = req.query;

    let modeType = _modeType;
    let page = Tools.toInteger(_page);
    let pageSize = Tools.toInteger(_pageSize);
    let players = Tools.toArray(_players);
    let topTen = Tools.toBoolean(_topTen);

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
      topTen,
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

    if (isNllOrUnd(matchId)) {
      mazzError.addParamError('Missing or invalid matchId');
    }

    if (isNllOrUnd(gamertag)) {
      mazzError.addParamError('Missing or invalid gamertag');
    }

    return {
      gamertag,
      matchId,
      mazzError,
    };
  },
  getMatchData: (req) => {
    const {
      matchId: _matchId,
    } = req.params;

    const matchId = _matchId;

    const mazzError = new MazzError(400);

    if (isNllOrUnd(matchId)) {
      mazzError.addParamError('Missing or invalid matchId');
    }

    return {
      matchId,
      mazzError,
    };
  },
};

module.exports = MatchesValidator;
