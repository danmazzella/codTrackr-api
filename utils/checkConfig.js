// NPM Module
const FS = require('fs');

// Utils
const { getKey } = require('./tools');
const { isNllOrUnd } = require('./validator');
const MazzError = require('./mazzErrors');
const Validator = require('./validator');

const { __basedir } = global;

const CheckConfig = () => {
  if (!FS.existsSync(`${__basedir}/config/config.environment.js`)) {
    if (!FS.existsSync(`${__basedir}/config`)) {
      FS.mkdirSync(`${__basedir}/config`);
    }
    FS.appendFileSync(`${__basedir}/config/config.environment.js`, configTemplate);
  }

  const EnvConfig = require('../config/config.environment'); // eslint-disable-line import/no-unresolved, global-require

  const mongoConfig = EnvConfig.mongo;
  if (isNllOrUnd(mongoConfig) || isNllOrUnd(mongoConfig.url) || mongoConfig.url === '{MONGODB_URL}') {
    throw new MazzError().addServerError('Please add a mongo URL');
  }

  const redisConfig = EnvConfig.redis;
  if (isNllOrUnd(redisConfig) || isNllOrUnd(redisConfig.url) || redisConfig.url === '{REDIS_URL}') {
    throw new MazzError().addServerError('Please add a Redis URL');
  }
  if (isNllOrUnd(redisConfig.port) || !Validator.isValidId(redisConfig.port)) {
    throw new MazzError().addServerError('Please add a Redis Port');
  }

  const devConfig = EnvConfig.dev;
  if (isNllOrUnd(devConfig) || isNllOrUnd(devConfig.url) || devConfig.url === '{DEV_API_URL}') {
    throw new MazzError().addServerError('Please add a dev URL');
  }

  const prodConfig = EnvConfig.prod;
  if (isNllOrUnd(prodConfig) || isNllOrUnd(prodConfig.url) || prodConfig.url === '{PROD_API_URL}') {
    throw new MazzError().addServerError('Please add a prod URL');
  }

  const emailConfig = EnvConfig.email;
  if (isNllOrUnd(emailConfig)
    || isNllOrUnd(emailConfig.username)
    || isNllOrUnd(emailConfig.password)
    || isNllOrUnd(emailConfig.fromAddress)
    || isNllOrUnd(emailConfig.toAddress)) {
    throw new MazzError().addServerError('Please add email details');
  }

  if (emailConfig.username === '{GMAIL_USERNAME}'
    || emailConfig.password === '{GMAIL_PASSWORD}'
    || emailConfig.fromAddress === '{FROM_EMAIL_ADDRESS}'
    || emailConfig.toAddress === '{TO_EMAIL_ADDRESS}') {
    throw new MazzError().addServerError('Please update email details');
  }

  const callOfDutyConfig = EnvConfig.callOfDuty;
  if (isNllOrUnd(callOfDutyConfig) || isNllOrUnd(getKey(callOfDutyConfig, 'email')) || isNllOrUnd(getKey(callOfDutyConfig, 'password'))) {
    throw new MazzError().addServerError('Please add Call of Duty details');
  }

  if (callOfDutyConfig.email === '{CALL_OF_DUTY_EMAIL}' || callOfDutyConfig.password === '{CALL_OF_DUTY_PASSWORD}') {
    throw new MazzError().addServerError('Please update Call of Duty details');
  }

  const adminConfig = EnvConfig.admin;
  if (isNllOrUnd(adminConfig) || isNllOrUnd(adminConfig.apiKey)) {
    throw new MazzError().addServerError('Please add Admin details');
  }

  if (adminConfig.apiKey === '{ADMIN_API_KEY}') {
    throw new MazzError().addServerError('Please update Admin details');
  }
};

const configTemplate = `module.exports = {
  mongo: {
    // ex: 'mongodb://username:password@127.0.0.1:27017/db'
    url: '{MONGODB_URL}',
  },
  redis: {
    // ex: 192.168.1.20
    url: '{REDIS_URL}',
    port: 6379,
  },
  dev: {
    // ex: http://localhost:8081
    url: '{DEV_API_URL}',
  },
  prod: {
    // ex: http://cod-api.mydomain.com
    url: '{PROD_API_URL}',
  },
  email: {
    // ex: dan@gmail.com
    username: '{GMAIL_USERNAME}',
    password: '{GMAIL_PASSWORD}',
    // ex: Dan Trixat <dan@gmail.com>
    fromAddress: '{FROM_EMAIL_ADDRESS',
    // ex: Trixat <dan@otheremail.com>
    toAddress: '{TO_EMAIL_ADDRESS}',
  },
  callOfDuty: {
    // ex: dan@cod.com
    email: '{CALL_OF_DUTY_EMAIL}',
    password: '{CALL_OF_DUTY_PASSWORD}',
  },
  admin: {
    // ex: Any random string
    apiKey: '{ADMIN_API_KEY'},
  },
};`;

module.exports = CheckConfig;