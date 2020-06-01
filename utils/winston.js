// NPM Modules
const winston = require('winston');

const { format } = winston;

const {
  combine,
  timestamp,
  printf,
  colorize,
  splat,
} = format;

const consoleFormat = printf((opt) => {
  const {
    timestamp, // eslint-disable-line no-shadow
    level,
    message,
  } = opt;

  if (opt.stack) {
    console.error(`${opt.message}\n${opt.stack}`);
  }

  let thisSplat = opt[Symbol.for('splat')] !== undefined ? opt[Symbol.for('splat')] : '';

  if (thisSplat !== undefined && thisSplat !== '') {
    thisSplat = JSON.stringify(thisSplat[0]);
  }

  return `${timestamp} -- [${level}]: ${message} ${thisSplat}`;
});

const transports = [
  new winston.transports.Console({
    level: 'debug',
    format: combine(
      splat(),
      colorize(),
      timestamp({ format: 'YYYY-MM-DDThh:mm:ss' }),
      consoleFormat,
    ),
  }),
];

const logger = winston.createLogger({
  exitOnError: false,
  level: 'debug',
  transports,
});

module.exports = logger;
