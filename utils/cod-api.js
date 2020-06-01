// NPM Modules
const crypto = require('crypto');
const SuperAgent = require('superagent');

// Utils
const EnvConfig = require('../config/config.environment');
const { getKey } = require('./tools');
const { isNllOrUnd } = require('./validator');
const Logger = require('./winston');
const MazzError = require('./mazzErrors');

// Datatypes
const { defaultPlatform } = require('../datatypes/player.datatypes');

// Constants
const COD_API_URL = 'https://my.callofduty.com/api/papi-client';
const COD_LOGIN_URL = 'https://profile.callofduty.com/cod/mapp';

let cookie = 'XSRF-TOKEN=Q4U7FSpwDNlVMxxUpgwUZJ6RKJQU9sxdMzmjudcUvb4BqX5ldDpbFPa-TSqxHUnR; '
  + 'API_CSRF_TOKEN=876555bb-ad00-4638-8b6a-be44637416de; ACT_SSO_LOCALE=en_US; '
  + 'country=US; new_SiteId=cod; ';

let codReq;

// Universal send request function, just pass in the necessary data
const callCodAPI = url => new Promise(async (resolve) => {
  if (cookie.indexOf('ACT_SSO_COOKIE') === -1) {
    Logger.debug('Start COD login');
    cookie = await CODAPI.login();
  }

  Logger.debug('Start callCodAPI: ', url);
  codReq = SuperAgent
    .get(url)
    .set({
      'Content-Type': 'application/json',
      Cookie: cookie,
    })
    .timeout({
      response: 60000, // Wait 60 seconds for the server to start sending,
    });

  codReq.end((err, body) => {
    try {
      if (!isNllOrUnd(err)) {
        Logger.error('Error in callCodAPI: ', err);
        clearTimeout(codTimer);
        return resolve(err);
      }

      Logger.debug('Got callCodAPI body');
      clearTimeout(codTimer);
      return resolve(body.body.data);
    } catch (e) {
      Logger.error('Error in Catch callCodAPI: ', err);
      clearTimeout(codTimer);
      return resolve(e);
    }
  });

  codReq.on('abort', () => {
    Logger.debug('Aborted');
    clearTimeout(codTimer);
  });

  codReq.on('error', (err) => {
    Logger.error('Error in callCodAPI: ', err);
    clearTimeout(codTimer);
    return resolve(err);
  });

  const codTimer = setTimeout(() => {
    Logger.debug('Abort codReq');
    codReq.abort();
    return resolve('Aborted Timeout');
  }, 65000);
});

const CODAPI = {
  login: async () => {
    const deviceId = crypto.createHash('md5').update(EnvConfig.callOfDuty.email).digest('hex');

    const registerRes = await SuperAgent
      .post(`${COD_LOGIN_URL}/registerDevice`)
      .send({
        deviceId,
      });

    if (isNllOrUnd(getKey(registerRes, 'body.data.authHeader'))) {
      Logger.error('Failed to registerDevice');
      throw new MazzError().addServerError('Unable to registerDevice with COD');
    }

    const loginRes = await SuperAgent
      .post(`${COD_LOGIN_URL}/login`)
      .send({
        email: EnvConfig.callOfDuty.email,
        password: EnvConfig.callOfDuty.password,
      })
      .set({
        Authorization: `bearer ${registerRes.body.data.authHeader}`,
        x_cod_device_id: deviceId,
      });

    if (isNllOrUnd(getKey(loginRes, 'body.rtkn')) || isNllOrUnd(getKey(loginRes, 'body.atkn')) || isNllOrUnd(getKey(loginRes, 'body.s_ACT_SSO_COOKIE'))) {
      Logger.error('Failed to login');
      throw new MazzError().addServerError('Unable to login with COD');
    }

    const loginResBody = loginRes.body;

    cookie = `${cookie} ACT_SSO_COOKIE=${loginResBody.s_ACT_SSO_COOKIE}; atkn=${loginResBody.atkn}; rtkn=${loginResBody.rtkn};`;

    return cookie;
  },
  // Search for users
  userSearch: (gamertag, platform = defaultPlatform) => new Promise((resolve, reject) => {
    const urlInput = `${COD_API_URL}/crm/cod/v2/platform/${platform}/username/${encodeURIComponent(gamertag)}/search`;
    callCodAPI(urlInput).then(data => resolve(data)).catch(e => reject(e));
  }),
  // Get all multiplayer stats
  getMPStats: (gamertag, platform = defaultPlatform) => new Promise((resolve) => {
    const urlInput = `${COD_API_URL}/stats/cod/v1/title/mw/platform/${platform}/gamer/${encodeURIComponent(gamertag)}/profile/type/mp`;
    callCodAPI(urlInput)
      .then(data => resolve(data))
      .catch(e => resolve(e));
  }),
  // Stats for WZ
  getWZStats: (gamertag, platform = defaultPlatform) => new Promise((resolve) => {
    const urlInput = `${COD_API_URL}/stats/cod/v1/title/mw/platform/${platform}/gamer/${encodeURIComponent(gamertag)}/profile/type/wz`;
    callCodAPI(urlInput).then(data => resolve(data)).catch(e => resolve(e));
  }),
  // Get the latest 20 warzone matches
  warzoneLatestMatches: (gamertag, platform = defaultPlatform) => new Promise((resolve) => {
    const urlInput = `${COD_API_URL}/crm/cod/v2/title/mw/platform/${platform}/gamer/${encodeURIComponent(gamertag)}/matches/wz/start/0/end/0/details`;
    callCodAPI(urlInput)
      .then(data => resolve(data))
      .catch(e => resolve(e));
  }),
  // Get latest 20 warzone matches between start and end time
  warzoneDateRangeMatches: (gamertag, startTime, endTime, platform = defaultPlatform) => new Promise((resolve) => {
    const urlInput = `${COD_API_URL}/crm/cod/v2/title/mw/platform/${platform}/gamer/${encodeURIComponent(gamertag)}/matches/wz/start/${startTime}/end/${endTime}/details`;
    callCodAPI(urlInput).then(data => resolve(data)).catch(e => resolve(e));
  }),
};

module.exports = CODAPI;