const sharedLogger = require('../../../util/logger.js');

const config = require('config');
const path = require('path');

const logPath = path.resolve(process.cwd(), config.TMS.log);

module.exports = sharedLogger(logPath);

