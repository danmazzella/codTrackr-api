// Tools
const Validator = require('./validator');

const tools = {
  toBoolean: (value) => {
    try {
      if (!Validator.isBoolean(value)) {
        return undefined;
      }

      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string') {
        return (value === 'true');
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  },
  toInteger: (value) => {
    if (!Validator.isValidId(value)) {
      return undefined;
    }

    if (Number.isNaN(value)) {
      return undefined;
    }

    return parseInt(value, 10);
  },
  toArray: (value) => {
    try {
      if (Array.isArray(value)) {
        return value;
      }

      return JSON.parse(value);
    } catch (error) {
      return undefined;
    }
  },
  toJson: (value) => {
    try {
      if (value instanceof Object) {
        return value;
      }

      return JSON.parse(value);
    } catch (error) {
      return undefined;
    }
  },
  loopOverJson: (json) => {
    const result = [];
    Object.keys(json).forEach((key) => {
      const tmpJson = json[key];
      tmpJson.key = key;
      result.push(tmpJson);
    });

    return result;
  },
  lowerCaseRegex: (string, exactMatch) => {
    if (!string || string === undefined || string === null) {
      return false;
    }
    if (exactMatch) {
      return new RegExp(`^${string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
    }

    return new RegExp(`${string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`, 'i');
  },
};

module.exports = tools;

module.exports.getKey = (obj, path, defaultValue = undefined) => {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};