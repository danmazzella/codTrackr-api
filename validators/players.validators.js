// Utilities
const MazzError = require('../utils/mazzErrors');
const Tools = require('../utils/tools');
const Validator = require('../utils/validator');

// DataTypes
const { platforms } = require('../datatypes/player.datatypes');

const PlayersValidator = {
  addPlayer: (req) => {
    const {
      name: _name,
      gamertag: _gamertag,
      platform: _platform,
    } = req.body;

    const name = _name;
    const gamertag = _gamertag;
    const platform = _platform;

    const mazzError = new MazzError(400);

    if (Validator.isNullOrUndefined(name) || !Validator.isValidString(name)) {
      mazzError.addParamError('Missing or invalid name');
    }

    if (Validator.isNullOrUndefined(gamertag) || !Validator.isValidString(gamertag)) {
      mazzError.addParamError('Missing or invalid gamertag');
    }

    if (Validator.isNullOrUndefined(platform) || platform !== platforms.battle || platform !== platforms.psn || platform !== platforms.steam || platform !== platforms.xbl) {
      mazzError.addParamError('Missing or invalid platform');
    }

    return {
      name,
      gamertag,
      platform,
      mazzError,
    };
  },
  fetchPlayerStats: (req) => {
    const {
      gamertag,
    } = req.params;

    const mazzError = new MazzError(400);

    if (Validator.isNullOrUndefined(gamertag) || !Validator.isValidString(gamertag)) {
      mazzError.addParamError('Missing or invalid gamertag');
    }

    return {
      gamertag,
      mazzError,
    };
  },
  getLifetimeStats: (req) => {
    const {
      modeType: _modeType,
      page: _page,
      pageSize: _pageSize,
      players: _players,
      sortColumn: _sortColumn,
      sortDir: _sortDir,
    } = req.query;

    let modeType = _modeType;
    let page = Tools.toInteger(_page);
    let pageSize = Tools.toInteger(_pageSize);
    let players = Tools.toArray(_players);
    let sortColumn = _sortColumn;
    let sortDir = _sortDir.toLowerCase();

    if (!Validator.isValidId(page)) {
      page = 1;
    }

    if (!Validator.isValidId(pageSize)) {
      pageSize = 25;
    }

    if (!Validator.isValidString(modeType)) {
      modeType = 'all';
    }

    if (Validator.isNullOrUndefined(sortColumn)) {
      sortColumn = 'avgOcaScore';
    }

    if (!Validator.isValidSortDir(sortDir)) {
      sortDir = 'desc';
    }

    if (!Array.isArray(players)) {
      players = undefined;
    }

    return {
      modeType,
      page,
      pageSize,
      players,
      sortColumn,
      sortDir,
    };
  },
  getRecentStats: (req) => {
    const {
      modeType: _modeType,
      page: _page,
      pageSize: _pageSize,
      players: _players,
      sortColumn: _sortColumn,
      sortDir: _sortDir,
    } = req.query;

    let modeType = _modeType;
    let page = Tools.toInteger(_page);
    let pageSize = Tools.toInteger(_pageSize);
    let players = Tools.toArray(_players);
    let sortColumn = _sortColumn;
    let sortDir = !Validator.isNullOrUndefined(_sortDir) ? _sortDir.toLowerCase() : undefined;

    if (!Validator.isValidId(page)) {
      page = 1;
    }

    if (!Validator.isValidId(pageSize)) {
      pageSize = 25;
    }

    if (!Validator.isValidString(modeType)) {
      modeType = 'all';
    }

    if (Validator.isNullOrUndefined(sortColumn)) {
      sortColumn = 'kills';
    }

    if (!Validator.isValidSortDir(sortDir)) {
      sortDir = 'desc';
    }

    if (!Array.isArray(players)) {
      players = undefined;
    }

    return {
      modeType,
      page,
      pageSize,
      players,
      sortColumn,
      sortDir,
    };
  },
};

module.exports = PlayersValidator;
