// www/util/logger.js
const pino = require('pino');

/**
 * LOG_LEVEL can be: fatal, error, warn, info, debug, trace
 * NODE_ENV: 'production' gets JSON logs; anything else gets pretty output.
 */
const level = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

const logger = pino(
  isProd
    ? { level } // JSON logs for prod/Docker
    : { level, transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } }
);

module.exports = logger;


