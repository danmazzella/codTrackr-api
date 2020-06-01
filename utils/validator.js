const REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line

const Validator = {
  isValidId(id) {
    if (this.isNullOrUndefined(id)) {
      return false;
    }
    return !Number.isNaN(id);
  },
  isBoolean(value) {
    try {
      if (typeof value === 'boolean') {
        return true;
      }

      if (typeof value === 'string' && (value.toLowerCase() === 'false' || value.toLowerCase() === 'true')) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  },
  isValidString(str, len) {
    if (!str || str.trim().length === 0 || typeof str !== 'string') return false;
    if (len && str.trim().length < len) return false;
    return true;
  },
  isValidEmail(email) {
    if (!email) return false;
    return REGEX_EMAIL.test(String(email.trim()).toLowerCase());
  },
  isValidEpoch(_time) {
    let time = _time;
    if (String.valueOf(time).length <= 10) {
      time *= 1000;
    }

    const startEpoch = (new Date(time)).getTime();
    if (startEpoch === undefined || Number.isNaN(startEpoch) || startEpoch < 1) {
      return false;
    }
    return time;
  },
  isAlphaNum(pValue) {
    const exp = new RegExp(/^([a-zA-Z0-9 _-]+)$/);
    if (exp.test(pValue)) {
      return true;
    }
    return false;
  },
  isNullOrUndefined(pValue) {
    // if (pValue === undefined || pValue === null || pValue.trim() === '') {
    if (pValue === undefined || pValue === null || (typeof pValue === 'string' && pValue.trim() === '')) {
      return true;
    }
    return false;
  },
  isValidSortDir(value) {
    if (this.isNullOrUndefined(value)) {
      return false;
    }

    if (value.toLowerCase() === 'asc' || value.toLowerCase() === 'desc') {
      return true;
    }
    return false;
  },
  isValidObject(value) {
    if (value instanceof Object) {
      return true;
    }

    return false;
  },
};


module.exports = Validator;

module.exports.isNllOrUnd = Validator.isNullOrUndefined;