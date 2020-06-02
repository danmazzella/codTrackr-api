// Tools
const { isNllOrUnd } = require('./validator');
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

module.exports.arrayToRedisKey = array => array.join(', ').replace(/, /g, '').toLowerCase();

module.exports.getKey = (obj, path, defaultValue = undefined) => {
  const resultString = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const finalResult = resultString(/[,[\]]+?/) || resultString(/[,[\].]+?/);
  return finalResult === undefined || finalResult === obj ? defaultValue : finalResult;
};

module.exports.replaceTemplateStrings = (_template, stringObj) => {
  let template = JSON.stringify(_template);
  template = template.replace(/"%\w+%"/g, (_all) => {
    const all = _all.replace(/"/g, '');
    let value = all;
    if (!isNllOrUnd(stringObj[all])) {
      value = stringObj[all];

      if (typeof stringObj[all] !== 'number') {
        value = `"${value}"`;
      }
    }
    return value;
  });
  return JSON.parse(template);
};